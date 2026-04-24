export interface DocumentSummary {
  id: string;
  name: string;
  chunkCount: number;
}

export interface ChatSource {
  id: string;
  documentId: string;
  documentName: string;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}
