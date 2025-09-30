import torch
import chormadb
from transformers import AutoTokenizer, AutoModel



abstract = """
Generative Adversarial Networks (GANs) are a class of machine learning frameworks
designed by Ian Goodfellow and his colleagues. A GAN model consists of two neural
networks, a generator and a discriminator, that are trained in an adversarial
process. This technique has shown remarkable success in generating realistic images
and is being explored for various other applications in data augmentation and style
transfer.
"""

tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')

inputs = tokenizer(abstract, return_tensors='pt', truncation=True, padding=True)

with torch.no_grad():
    outputs = model(**inputs)
    
last_hidden_states = outputs.last_hidden_state
attention_mask = inputs['attention_mask']
mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_states.size()).float()
sum_embeddings = torch.sum(last_hidden_states * mask_expanded, 1)
sum_mask = torch.clamp(mask_expanded.sum(1), min=1e-9)
mean_pooled_embedding = sum_embeddings / sum_mask

print("Shape of the final embedding vector:")
print(mean_pooled_embedding.shape)

print("\nFirst 10 values of the embedding:")
print(mean_pooled_embedding[0, :10])