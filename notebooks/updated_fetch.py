import pyalex
import chromadb
import time
import os
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModel
import tqdm
import torch

load_dotenv()

CHROMA_API_KEY = os.getenv('CHROMA_API_KEY')
CHROMA_HOST = os.getenv("CHROMA_HOST")
client = chromadb.CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_HOST,               
    database='hackcora'                                           
)

collection = client.get_or_create_collection('updated_journals')

CHROMA_API_KEY = os.getenv('CHROMA_API_KEY')
CHROMA_HOST = os.getenv("CHROMA_HOST")
COLLECTION_NAME = "journal_db"

# --- SciBERT Model Configuration ---
MODEL_NAME = 'allenai/scibert_scivocab_uncased'

# --- Script Configuration ---
BATCH_SIZE = 50  # Number of journals to process before upserting to ChromaDB

# ==============================================================================
# --- 2. SETUP (MODELS, DATABASE CONNECTION) ---
# ==============================================================================

print("Setting up models and database connection...")

# --- Load SciBERT Model and Tokenizer ---
print(f"Loading tokenizer and model: '{MODEL_NAME}'...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(device)


# ==============================================================================
# --- 3. EMBEDDING FUNCTION ---
# ==============================================================================

def get_scibert_embedding(text):
    """Generates a SciBERT embedding for a single piece of text."""
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Mean pooling
    last_hidden_states = outputs.last_hidden_state
    attention_mask = inputs['attention_mask']
    mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_states.size()).float()
    sum_embeddings = torch.sum(last_hidden_states * mask_expanded, 1)
    sum_mask = torch.clamp(mask_expanded.sum(1), min=1e-9)
    mean_pooled_embedding = sum_embeddings / sum_mask
    
    # Return a flat list of floats
    return mean_pooled_embedding[0].cpu().numpy().tolist()

# ==============================================================================
# --- 4. MAIN POPULATION LOGIC ---
# ==============================================================================

if __name__ == "__main__":
    print("\n🚀 Starting the data population process...")

    # Lists to hold data for batch upserting
    ids_to_upsert = []
    embeddings_to_upsert = []
    documents_to_upsert = []
    metadatas_to_upsert = []
    
    total_journals_processed = 0

    # --- Fetch Concepts from OpenAlex ---
    print("Fetching concepts from OpenAlex...")
    concepts = pyalex.Concepts().get(per_page=25) # Adjust as needed

    # --- Loop Through Concepts and Journals ---
    for concept in concepts:
        concept_id = concept['id']
        print(f"\n--- Processing Concept: '{concept.get('display_name')}' ---")

        journals = pyalex.Sources().filter(
            concepts={"id": concept_id},
            type="journal"
        ).get(per_page=50) # Adjust as needed

        if not journals:
            print("  -> No journals found for this concept. Skipping.")
            continue

        for journal in tqdm.tqdm(journals, desc="  Processing Journals"):
            # --- a. Validate and Extract Data ---
            journal_id = journal.get('id', '').split('/')[-1]
            title = journal.get('display_name')

            if not journal_id or not title:
                print(f"  - Skipping journal due to missing ID or title.")
                continue

            # --- b. Prepare Metadata and Document Text ---
            concepts_list = [c.get('display_name') for c in journal.get('concepts', []) if c.get('display_name')]
            concepts_str = ", ".join(concepts_list)
            
            # This is the text we will generate the embedding from
            text_to_embed = f"{title}. Concepts: {concepts_str}"
            
            metadata = {
                "title": title,
                "publisher": journal.get('publisher', 'N/A'),
                "concepts": concepts_str,
                "is_oa": journal.get('is_oa', False),
                "2yr_mean_citedness": journal.get('summary_stats', {}).get('2yr_mean_citedness', 0.0),
            }

            # --- c. Generate Embedding ---
            embedding = get_scibert_embedding(text_to_embed)

            # --- d. Add to Batch ---
            ids_to_upsert.append(journal_id)
            embeddings_to_upsert.append(embedding)
            documents_to_upsert.append(text_to_embed)
            metadatas_to_upsert.append(metadata)
            total_journals_processed += 1

            # --- e. Upsert Batch to ChromaDB when it's full ---
            if len(ids_to_upsert) >= BATCH_SIZE:
                print(f"\n  Upserting batch of {len(ids_to_upsert)} journals...")
                collection.upsert(
                    ids=ids_to_upsert,
                    embeddings=embeddings_to_upsert,
                    documents=documents_to_upsert,
                    metadatas=metadatas_to_upsert
                )
                # Clear the batch lists
                ids_to_upsert, embeddings_to_upsert, documents_to_upsert, metadatas_to_upsert = [], [], [], []
    
    # --- Upsert any remaining items in the final batch ---
    if ids_to_upsert:
        print(f"\n  Upserting final batch of {len(ids_to_upsert)} journals...")
        collection.upsert(
            ids=ids_to_upsert,
            embeddings=embeddings_to_upsert,
            documents=documents_to_upsert,
            metadatas=metadatas_to_upsert
        )

    print("\n🏁 Population complete!")
    print(f"  Total journals processed: {total_journals_processed}")
    print(f"  The collection now contains {collection.count()} items.")