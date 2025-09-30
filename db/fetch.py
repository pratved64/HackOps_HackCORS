import pyalex
import json
from tqdm import tqdm

# --- CONFIG ---
pyalex.config.email = "your_email@example.com"

# Load fields of study
fields_of_study = []
with open("fields.txt", "r", encoding="utf-8") as f:
    fields_of_study = [line.strip() for line in f if line.strip()]
print(f"Loaded {len(fields_of_study)} fields of study.")

journals_per_field = 25
all_journals_metadata = {}
simple_journals_list = {}  # For storing just id:name

print(f"Starting metadata discovery for {len(fields_of_study)} fields...")

for field in tqdm(fields_of_study, desc="Processing Fields"):
    try:
        # Step 1: Get Concept ID
        concepts = pyalex.Concepts().search_filter(display_name=field).get(per_page=1)
        if not concepts:
            continue
        concept_id = concepts[0]['id']

        # Step 2: Get journals (sources) for that concept
        venues = pyalex.Sources().filter(
            concepts={'id': concept_id},
            type="journal"
        ).sort(
            works_count="desc"
        ).get(per_page=journals_per_field)

        for venue in venues:
            journal_id = venue['id']
            journal_name = venue.get("display_name", "Unknown Journal")

            # Store full metadata
            if journal_id not in all_journals_metadata:
                all_journals_metadata[journal_id] = {
                    "id": journal_id,
                    "display_name": journal_name,
                    "issn": venue.get("issn"),
                    "publisher": venue.get("publisher"),
                    "works_count": venue.get("works_count"),
                    "cited_by_count": venue.get("cited_by_count"),
                    "homepage_url": venue.get("homepage_url"),
                    "is_oa": venue.get("is_oa"),
                    "is_in_doaj": venue.get("is_in_doaj"),
                    "society": venue.get("society"),
                    "summary_stats": venue.get("summary_stats"),
                    "concepts": venue.get("concepts")
                }

            # Store simple id:name pair
            if journal_id not in simple_journals_list:
                simple_journals_list[journal_id] = journal_name

    except Exception as e:
        print(f"Error processing {field}: {e}")

# --- Save full metadata ---
with open("journals_metadata.json", "w", encoding="utf-8") as f:
    json.dump(all_journals_metadata, f, indent=4)

# --- Save simple id:name list ---
with open("journals_list.json", "w", encoding="utf-8") as f:
    json.dump(simple_journals_list, f, indent=4)

print(f"\n✅ Saved metadata for {len(all_journals_metadata)} journals to 'journals_metadata.json'")
print(f"✅ Saved simple list for {len(simple_journals_list)} journals to 'journals_list.json'")
