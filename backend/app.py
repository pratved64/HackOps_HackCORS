import os
import httpx # Required for asynchronous HTTP requests to the Gemini API
from dotenv import load_dotenv # Required to load environment variables from a .env file
from contextlib import asynccontextmanager

# --- ADD THIS IMPORT ---
import uvicorn 

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch
import chromadb
# The CloudClient method in your original code doesn't typically need Settings
# from chromadb.config import Settings 

# Load environment variables from .env file
load_dotenv()

# Environment variables (assuming they are set in .env)
# NOTE: The client initialization below uses hardcoded API key and tenant/database.
# For production, you should use os.getenv() for all sensitive info.
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL")
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY") # This is not strictly used below, but kept for context

# --- App Lifespan and Initialization (Best Practice for httpx.AsyncClient) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    Creates and closes a single, reusable httpx.AsyncClient for efficiency.
    """
    # STARTUP: Create a single httpx.AsyncClient for the entire application lifetime
    # This enables connection pooling and is much more efficient.
    app.state.gemini_client = httpx.AsyncClient(timeout=30.0)
    print("Application started. Gemini AsyncClient initialized.")
    yield
    # SHUTDOWN: Close the client gracefully
    await app.state.gemini_client.aclose()
    print("Application shut down. Gemini AsyncClient closed.")

# Initialize FastAPI app with the lifespan manager
app = FastAPI(lifespan=lifespan) 

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class PaperRequest(BaseModel):
    text: str
    top_n: int = 5

class GeminiRequest(BaseModel):
    prompt: str

class GeminiResponse(BaseModel):
    generated_text: str

# --- Model and DB Initialization ---
model_name = "allenai/scibert_scivocab_uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
# Determine the device to run the model on
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

# NOTE: Using hardcoded credentials and CloudClient as per your input.
# In a real-world app, API key should be from os.getenv("CHROMA_API_KEY").
try:
    client = chromadb.CloudClient(
        api_key='ck-CHSy34MLNps3LhzWLZ4GR1qUdRp6cej5hsFGo3u8v5vc', 
        tenant='546518b2-9bd8-4dea-b95e-315ebf0146a9', 
        database='hackcora' 
    )
    collection = client.get_or_create_collection(name="updated_journals")
except Exception as e:
    print(f"Warning: Could not connect to ChromaDB Cloud. Search functionality may fail. Error: {e}")
    # Create a mock client/collection to allow the app to run (for testing other endpoints)
    class MockCollection:
        def query(self, *args, **kwargs):
            raise Exception("ChromaDB connection failed. Cannot query journals.")
    collection = MockCollection()


# --- Utility Functions ---
def embed_text(text: str):
    """Generates an embedding for the input text using the SciBERT model."""
    encoded_input = tokenizer(
        text,
        padding=True,
        truncation=True,
        return_tensors="pt"
    )
    input_ids = encoded_input["input_ids"].to(device)
    attention_mask = encoded_input["attention_mask"].to(device)
    
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs.last_hidden_state
    
    # Calculate Mean Pooling (average of token embeddings, masked by attention)
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded, dim=1)
    sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    embedding = sum_embeddings / sum_mask
    
    # Returns a 2D list: [[...embedding...]]
    return embedding.cpu().numpy().tolist()

def query_chroma_journals(collection, input_text: str, top_n: int):
    """Queries the ChromaDB collection for similar journals based on input text."""
    input_embedding = embed_text(input_text)
    
    # query_embeddings expects a list of embeddings
    results = collection.query(
        query_embeddings=input_embedding,
        n_results=top_n
    )
    
    journals_list = []
    # Process the results from the first (and only) query
    for i in range(len(results['ids'][0])):
        journal_info = {
            "name": results['metadatas'][0][i].get("name", ""),
            "description": results['documents'][0][i],
            # Distance is typically a measure of dissimilarity (lower score is better)
            "score": results['distances'][0][i] 
        }
        journals_list.append(journal_info)
    return journals_list

# --- Endpoints ---

@app.get("/")
def read_root():
    """Simple health check endpoint."""
    return {"status": "ok", "message": "FastAPI is running"}

@app.post("/search_journals")
def search_journals(request: PaperRequest):
    """
    Performs a semantic search for relevant journals using SciBERT and ChromaDB.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Input text is required")
    
    try:
        top_journals = query_chroma_journals(collection, request.text, request.top_n)
        return {"results": top_journals}
    except Exception as e:
        print(f"Error in search_journals: {e}")
        # The exception message should be safe for the client
        error_detail = "Internal Server Error during search (Check server console for ChromaDB connection issues)."
        if "Cannot query journals" in str(e):
             error_detail = "ChromaDB connection or query failed. Check credentials and database status."
        raise HTTPException(status_code=500, detail=error_detail)

# --- Gemini API Endpoint ---

@app.post("/generate", response_model=GeminiResponse)
async def generate_text_from_gemini(request_body: GeminiRequest):
    """
    Accepts a prompt and returns text generated by the Gemini model.
    """
    if not GEMINI_KEY or not GEMINI_API_URL:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY or GEMINI_API_URL is not set.")

    # 1. Format the request payload for the Gemini API
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": request_body.prompt
                    }
                ]
            }
        ]
    }

    # 2. Make the asynchronous API call to Gemini
    try:
        # Use the single, persistent client instance from the app state
        client = app.state.gemini_client 
        
        response = await client.post(
            GEMINI_API_URL,
            json=payload,
            # Pass the API key in the header as a best practice, but ensure the URL doesn't already contain it.
            headers={"Content-Type": "application/json", "x-api-key": GEMINI_KEY}, 
        )
        
        # Raise an exception for HTTP error status codes (4xx or 5xx)
        response.raise_for_status()
            
        # 3. Process the response from Gemini
        gemini_data = response.json()
            
        # Safely extract the generated text from the nested JSON structure
        generated_text = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        if not generated_text:
            block_reason = gemini_data.get("promptFeedback", {}).get("blockReason", "Unknown")
            error_detail = f"Could not extract generated text. Blocked/Error Reason: {block_reason}."
            
            print(f"Gemini generation failed. Full response: {gemini_data}")
            raise HTTPException(status_code=500, detail=error_detail)

        # 4. Return the formatted response
        return GeminiResponse(generated_text=generated_text)

    except httpx.HTTPStatusError as e:
        print(f"Gemini API HTTP Status Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Gemini API error: {e.response.text}")
    except Exception as e:
        print(f"An unexpected error occurred in /generate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# --- RUNNING THE APPLICATION ---

if __name__ == "__main__":
    # This block ensures the app runs when the file is executed directly.
    # Replace 'your_file_name' with the actual name of this Python file (e.g., 'main').
    # The 'app' must match the FastAPI instance name (app = FastAPI(...)).
    uvicorn.run(
        "your_file_name:app",  # Change 'your_file_name' to the name of this script (e.g., 'server:app' if the file is server.py)
        host="0.0.0.0",        # Listens on all interfaces (accessible externally)
        port=8000,             # Default FastAPI port
        reload=True            # Enables auto-reload for development/debugging
    )