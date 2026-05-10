from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print(embeddings)



result = embeddings.embed_query("What is justice?")
print(f"Vector length: {len(result)}")  # Should be 384
print(f"First 5 values: {result[:5]}")