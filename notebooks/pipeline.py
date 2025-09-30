import torch
import chromadb
import os
import tqdm
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModel

abstract = """
Generative Adversarial Networks (GANs) are a class of machine learning frameworks
designed by Ian Goodfellow and his colleagues. A GAN model consists of two neural
networks, a generator and a discriminator, that are trained in an adversarial
process. This technique has shown remarkable success in generating realistic images
and is being explored for various other applications in data augmentation and style
transfer.
"""

load_dotenv()

CHROMA_API_KEY = os.getenv('CHROMA_API_KEY')
CHROMA_HOST = os.getenv("CHROMA_HOST")
print(CHROMA_API_KEY)

tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')
device = "cuda" if torch.cuda.is_available() else "cpu"


# chromadb connection
print("Connecting to chromadb...")
client = chromadb.CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_HOST,               
    database='hackcora'                                           
)

collection = client.get_collection('journal_db')

def get_scibert_embedding(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        
    last_hidden_states = outputs.last_hidden_state
    attention_mask = inputs['attention_mask']
    mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_states.size()).float()
    sum_embeddings = torch.sum(last_hidden_states * mask_expanded, 1)
    sum_mask = torch.clamp(mask_expanded.sum(1), min=1e-9)
    mean_pooled_embedding = sum_embeddings / sum_mask
    return mean_pooled_embedding[0].cpu().numpy().tolist()

results = collection.get(include=["metadatas", "documents"])
print(f"Found {len(results['ids'])} journals to process.")

for i in tqdm.tqdm(range(len(results['ids'])), desc="Processing Journals..."):
    journal_id = results['ids'][i]
    journal_metadata = results['metadatas'][i]
    journal_document = results['documents'][i]

    # You can reconstruct the text from the document or metadata
    # Assuming the document is already in the format: "title: description"
    text_to_embed = journal_document

    # 3. Generate the new embedding
    embedding = get_scibert_embedding(text_to_embed)

    # 4. Upsert the data with the new embedding
    # This updates the entry with the matching ID, adding the embedding.
    # It will not erase other data or the database.
    collection.upsert(
        ids=[journal_id],
        embeddings=[embedding],
        documents=[journal_document], # Keep the original document
        metadatas=[journal_metadata]  # Keep the original metadata
    )

print("\nEnrichment complete! All journals now have a vector embedding in the database.")

print("\n--- Verifying the data ---")
count = collection.count()
print(f"The collection now contains {count} items.")

