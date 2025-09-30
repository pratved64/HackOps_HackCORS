from transformers import AutoTokenizer, AutoModel
import torch
model_name = "allenai/scibert_scivocab_uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()  # set to evaluation mode
# 🔹 Function to embed text
def embed_text(text):
    # Tokenize input
    encoded_input = tokenizer(text,padding=True,truncation=True,return_tensors="pt")
    input_ids = encoded_input["input_ids"].to(device)
    attention_mask = encoded_input["attention_mask"].to(device)
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
    sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded, dim=1)
    sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    embedding = sum_embeddings / sum_mask
    return embedding 
input_text= "Deep Learning for Protein Structure Prediction."
print(embed_text(input_text)[:10])


