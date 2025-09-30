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
client = chromadb.HttpClient(
    host=CHROMA_HOST,
    headers={"Authorization": f"Bearer: {CHROMA_API_KEY}"}
)


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
    return mean_pooled_embedding.cpu().numpy().tolist()

# SAMPLE, REMOVE BEFORE PUSHING TO DEPLOYMENT
# balls
journals = [
    {
        "id": "J001",
        "title": "Journal of Machine Learning Research",
        "description": "Provides a forum for the dissemination of research in all areas of machine learning.",
        "citations": 150000,
        "publisher": "MIT Press"
    },
    {
        "id": "J002",
        "title": "Nature Biotechnology",
        "description": "A monthly journal covering the science and business of biotechnology. Publishes new concepts in technology and methodology.",
        "citations": 850000,
        "publisher": "Springer Nature"
    },
    {
        "id": "J003",
        "title": "Cell",
        "description": "Publishes findings of unusual significance in any area of experimental biology, including molecular biology, genetics, and immunology.",
        "citations": 1200000,
        "publisher": "Cell Press"
    },
    {
        "id": "J004",
        "title": "The Lancet",
        "description": "An international general medical journal that publishes high-impact research, reviews, and clinical cases.",
        "citations": 2500000,
        "publisher": "Elsevier"
    }
]

for journal in tqdm(journals, desc="Processing Journals..."):
    text_to_embed = f"{journal['title']}: {journal['description']}"

    embedding = get_scibert_embedding(text_to_embed)

    collection.upsert( # define collections once the chromadb is ready
        ids=[journal["id"]],
        embeddings=embedding,
        documents=[text_to_embed],
        metadatas=[{
            "title": journal["title"],
            "citations": journal["citations"],
            "publisher": journal["publisher"]
        }]
    )

print("\nEnrichment complete! All journals now have a vector embedding in the database.")

print("\n--- Verifying the data ---")
count = collection.count()
print(f"The collection now contains {count} items.")

