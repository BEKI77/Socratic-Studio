import {
  chunkText,
  tokenize,
  vectorize,
  cosineSimilarity,
  type ChunkRecord,
} from "@/lib/text-utils";

interface StoredDocument {
  id: string;
  name: string;
  text: string;
  chunks: ChunkRecord[];
}

const documents: StoredDocument[] = [];

function createChunkRecord({
  documentId,
  documentName,
  text,
}: {
  documentId: string;
  documentName: string;
  text: string;
}): ChunkRecord {
  const tokens = tokenize(text);
  return {
    id: `${documentId}-${Math.random().toString(36).slice(2, 8)}`,
    documentId,
    documentName,
    text,
    vector: vectorize(tokens),
  };
}

export function listDocuments() {
  return documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    chunkCount: doc.chunks.length,
  }));
}

export function addDocument({ name, text }: { name: string; text: string }) {
  const id = `doc-${Math.random().toString(36).slice(2, 10)}`;
  const chunks = chunkText(text).map((chunk) =>
    createChunkRecord({ documentId: id, documentName: name, text: chunk })
  );
  const document: StoredDocument = {
    id,
    name,
    text,
    chunks,
  };
  documents.push(document);
  return document;
}

export function searchDocuments(query: string, { topK = 4 }: { topK?: number } = {}) {
  const queryVector = vectorize(tokenize(query));
  const scored = documents.flatMap((doc) =>
    doc.chunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryVector, chunk.vector),
    }))
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((entry) => entry.chunk);
}

export function resetDocuments() {
  documents.splice(0, documents.length);
}
