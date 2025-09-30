
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
    # Validate API key exists and is not a placeholder
    if not GEMINI_KEY:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY is not set. Please add your Gemini API key to the .env file."
        )
    
    if GEMINI_KEY == "your_gemini_api_key_here" or GEMINI_KEY == "AIzaSyYourActualKeyHere":
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is still set to placeholder value. Please replace it with your actual API key from https://makersuite.google.com/app/apikey"
        )

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

    # 2. Construct the API URL with the key as a query parameter (Gemini API standard)
    # Using gemini-1.5-flash for faster responses, or use gemini-pro for more advanced responses
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"

    # 3. Make the asynchronous API call to Gemini
    try:
        # Use the single, persistent client instance from the app state
        client = app.state.gemini_client 
        
        print(f"[Gemini] Sending request to Gemini API...")
        response = await client.post(
            api_url,
            json=payload,
            headers={"Content-Type": "application/json"}, 
        )
        
        # Raise an exception for HTTP error status codes (4xx or 5xx)
        response.raise_for_status()
            
        # 4. Process the response from Gemini
        gemini_data = response.json()
        print(f"[Gemini] Received response from Gemini API")
            
        # Safely extract the generated text from the nested JSON structure
        generated_text = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        if not generated_text:
            block_reason = gemini_data.get("promptFeedback", {}).get("blockReason", "Unknown")
            error_detail = f"Could not extract generated text. Blocked/Error Reason: {block_reason}. Full response logged to console."
            
            print(f"[Gemini] Generation failed. Full response: {gemini_data}")
            raise HTTPException(status_code=500, detail=error_detail)

        print(f"[Gemini] Successfully generated {len(generated_text)} characters")
        # 5. Return the formatted response
        return GeminiResponse(generated_text=generated_text)

    except httpx.HTTPStatusError as e:
        error_text = e.response.text
        print(f"[Gemini] API HTTP Status Error: {e.response.status_code} - {error_text}")
        
        # Provide helpful error messages for common issues
        if e.response.status_code == 400:
            if "API_KEY_INVALID" in error_text or "invalid" in error_text.lower():
                detail = "Invalid Gemini API key. Please check your API key at https://makersuite.google.com/app/apikey"
            else:
                detail = f"Bad request to Gemini API: {error_text}"
        elif e.response.status_code == 403:
            detail = "Access forbidden. Your API key may not have permission to use this model."
        elif e.response.status_code == 429:
            detail = "Rate limit exceeded. Please wait a moment and try again."
        else:
            detail = f"Gemini API error ({e.response.status_code}): {error_text}"
        
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    
    except httpx.RequestError as e:
        print(f"[Gemini] Network error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Network error connecting to Gemini API: {str(e)}")
    
    except Exception as e:
        print(f"[Gemini] Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# --- RUNNING THE APPLICATION ---

if __name__ == "__main__":
    # This block ensures the app runs when the file is executed directly.
    # Replace 'your_file_name' with the actual name of this Python file (e.g., 'main').
    # The 'app' must match the FastAPI instance name (app = FastAPI(...)).
    uvicorn.run(
        "app:app",  # Change 'your_file_name' to the name of this script (e.g., 'server:app' if the file is server.py)
        host="localhost",        # Listens on all interfaces (accessible externally)
        port=8000,             # Default FastAPI port
        reload=True            # Enables auto-reload for development/debugging
    )
