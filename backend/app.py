from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch
import chromadb
from chromadb.config import Settings
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class PaperRequest(BaseModel):
    text: str
    top_n: int = 5  # default number of journals
model_name = "allenai/scibert_scivocab_uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_db"
))
collection = client.get_or_create_collection(name="journals")
def embed_text(text: str):
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
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded, dim=1)
    sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    embedding = sum_embeddings / sum_mask
    return embedding.cpu().numpy()
def query_chroma_journals(collection, input_text: str, top_n: int):
    input_embedding = embed_text(input_text)
    results = collection.query(
        query_embeddings=[input_embedding],
        n_results=top_n)
    journals_list = []
    for i in range(len(results['ids'][0])):
        journal_info = {
            "name": results['metadatas'][0][i].get("name", ""),
            "description": results['documents'][0][i],
            "score": results['distances'][0][i]
        }
        journals_list.append(journal_info)
    return journals_list
@app.post("/search_journals")
def search_journals(request: PaperRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Input text is required")
    
    try:
        top_journals = query_chroma_journals(collection, request.text, request.top_n)
        return {"results": top_journals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
