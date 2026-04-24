import type { ChatMessage, DocumentSummary } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseJson(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    const error = typeof payload?.detail === "string" ? payload.detail : "Request failed.";
    throw new Error(error);
  }
  return payload;
}

export async function fetchDocuments(): Promise<DocumentSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`);
    const payload = await parseJson(response);
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function uploadDocument(file: File): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseJson(response);
}

export async function askQuestion(question: string) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  return parseJson(response) as Promise<{
    response: string;
    sources: ChatMessage["sources"];
  }>;
}
