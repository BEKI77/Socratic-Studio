import type { ChatMessage, DocumentSummary, DocumentUploadResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function parseJson(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    const error = typeof payload?.detail === "string" ? payload.detail : "Request failed.";
    throw new Error(error);
  }
  return payload;
}

export async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  return parseJson(response) as Promise<{ access_token: string; token_type: string }>;
}

export async function fetchMe(token: string) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getHeaders(token),
  });
  return parseJson(response);
}

export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  return parseJson(response);
}

export async function fetchDocuments(token: string): Promise<DocumentSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: getHeaders(token),
    });
    
    const payload = await parseJson(response);
    return payload.documents ?? [];
  } catch {
    return [];
  }
}

export async function uploadDocument(file: File, token: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getHeaders(token),
    body: formData,
  });

  return parseJson(response);
}

export async function fetchDocumentChunks(source: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(source)}`, {
    headers: getHeaders(token),
  });
  return parseJson(response) as Promise<{
    source: string;
    chunks: { content: string; chunkIndex: number; source: string; page: number | null }[];
  }>;
}

export async function askQuestion(question: string, token: string, chatId?: number) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...getHeaders(token)
    },
    body: JSON.stringify({ question, chat_id: chatId }),
  });

  return parseJson(response) as Promise<{
    role: string;
    content: string;
  }>;
}

export async function fetchChatSessions(token: string) {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    headers: getHeaders(token),
  });
  return parseJson(response);
}

export async function fetchChatSession(chatId: number, token: string) {
  const response = await fetch(`${API_BASE_URL}/sessions/${chatId}`, {
    headers: getHeaders(token),
  });
  return parseJson(response);
}
