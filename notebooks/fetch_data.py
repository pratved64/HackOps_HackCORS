import pyalex
import chromadb
import time
import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_API_KEY = os.getenv('CHROMA_API_KEY')
CHROMA_HOST = os.getenv("CHROMA_HOST")
client = chromadb.CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_HOST,               
    database='hackcora'                                           
)

# ==============================================================================
# --- 1. CONFIGURATION ---
# ==============================================================================

# --- PyAlex API Configuration ---
# Setting your email is crucial for reliable and polite API access.
# PyAlex will automatically use this to add you to the "polite pool".
YOUR_EMAIL = os.environ.get("YOUR_EMAIL", "your.email@example.com")
pyalex.config.email = "pratyushved12@gmail.com"

# --- ChromaDB Configuration ---
# Use this for connecting to a cloud or remote server

# Or uncomment this for a local, file-based instance
# client = chromadb.PersistentClient(path="./chroma_db_pyalex")

COLLECTION_NAME = "journal_db"

# ==============================================================================
# --- 2. MAIN EXECUTION LOGIC ---
# ==============================================================================

if __name__ == "__main__":
    print("🚀 Starting the OpenAlex to ChromaDB ingestion process using pyalex...")

    # Initialize ChromaDB connection and get (or create) the collection
    try:
        collection = client.get_or_create_collection(name=COLLECTION_NAME)
        print(f"Connected to ChromaDB and using collection: '{COLLECTION_NAME}'")
    except Exception as e:
        print(f"❌ Could not connect to ChromaDB. Please ensure it's running. Error: {e}")
        exit()


    # STEP 1: Fetch unique concepts using pyalex
    try:
        print("Fetching 10 unique concepts...")
        # .get() retrieves the results as a list of dictionaries
        concepts = pyalex.Concepts().get(per_page=30)
        print("✅ Successfully fetched concepts.")
    except Exception as e:
        print(f"❌ Error fetching concepts with pyalex: {e}")
        exit()

    total_journals_added = 0
    # Iterate through each concept we found
    for concept in concepts:
        concept_id = concept['id'] # pyalex provides the full ID URL
        print(f"\nProcessing Concept: '{concept.get('display_name')}'")

        # STEP 2: Find journals (Sources) for the current concept
        # We filter Sources by concept ID and ensure the type is 'journal'.
        print(f"  -> Finding up to 5 journals for this concept...")
        try:
            journals = pyalex.Sources().filter(
                concepts={"id": concept_id},
                type="journal" # This ensures we only get journals from Sources
            ).get(per_page=20)
        except Exception as e:
            print(f"  -> Error fetching journals for concept {concept_id}: {e}")
            continue # Skip to the next concept

        if not journals:
            print("  -> No journals found for this concept. Skipping.")
            continue

        # Prepare lists for batch insertion into ChromaDB
        documents_to_add = []
        metadatas_to_add = []
        ids_to_add = []
        
        # STEP 3: Extract the required fields from each journal
        for journal in journals:
            # The journal ID from OpenAlex will be our unique ID in ChromaDB
            # We take the short form of the ID (e.g., S12345)
            journal_id = journal['id'].split('/')[-1]
            
            if not journal.get('id') or not journal.get('display_name') or not journal.get('summary_stats'):
                print(f"  - Skipping journal due to missing critical data (ID or display_name).")
                continue

            # Optional: Check if the journal ID already exists to avoid duplicates
            if collection.get(ids=[journal_id])['ids']:
                print(f"  - Skipping journal '{journal.get('display_name')}'. Already in collection.")
                continue

            # This is the text that gets embedded by ChromaDB
            document_text = journal.get('display_name', 'No Title')
            
            # This is the structured data we want to store alongside the vector
            metadata = {
                'display_name': journal.get('display_name'),
                'is_oa': journal.get('is_oa', False),
                '2yr_mean_citedness': journal.get('summary_stats', {}).get('2yr_mean_citedness', 0.0),
                'concepts': ", ".join([
                    c.get('display_name') for c in journal.get('concepts', []) if c.get('display_name')
                ]),
            }
            
            documents_to_add.append(document_text)
            metadatas_to_add.append(metadata)
            ids_to_add.append(journal_id)

        # STEP 4: Add the processed journals to ChromaDB in a single batch
        if documents_to_add:
            try:
                collection.add(
                    documents=documents_to_add,
                    metadatas=metadatas_to_add,
                    ids=ids_to_add
                )
                print(f"  ✅ Successfully added {len(documents_to_add)} journals to ChromaDB.")
                total_journals_added += len(documents_to_add)
            except Exception as e:
                print(f"  ❌ Error adding documents to ChromaDB: {e}")

    print(f"\n🏁 Process complete. Total new journal entries added: {total_journals_added}")

