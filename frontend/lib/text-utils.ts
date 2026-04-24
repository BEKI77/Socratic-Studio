export interface ChunkRecord {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  vector: Map<string, number>;
}

export interface SocraticResponseSource {
  id: string;
  documentId: string;
  documentName: string;
  preview: string;
}

export interface SocraticResponse {
  response: string;
  sources: SocraticResponseSource[];
}

export interface ChunkOptions {
  maxLength?: number;
  overlap?: number;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "from",
  "this",
  "there",
  "into",
  "about",
  "your",
  "you",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "can",
  "will",
  "should",
  "could",
  "would",
  "what",
  "when",
  "where",
  "which",
  "while",
  "been",
  "their",
  "they",
  "them",
  "then",
  "than",
  "also",
  "such",
  "using",
  "use",
  "used",
  "but",
  "not",
  "only",
  "does",
  "did",
  "how",
]);

const WORD_REGEX = /[a-zA-Z0-9]+/g;

export function chunkText(text: string, { maxLength = 900, overlap = 120 }: ChunkOptions = {}) {
  if (!text) return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  const safeOverlap = Math.min(overlap, Math.max(maxLength - 1, 0));
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxLength, normalized.length);
    const slice = normalized.slice(start, end);
    chunks.push(slice);
    if (end === normalized.length) {
      break;
    }
    start = end - safeOverlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

export function tokenize(text: string) {
  if (!text) return [];
  const matches: string[] = text.toLowerCase().match(WORD_REGEX) ?? [];
  return matches.filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function vectorize(tokens: string[]) {
  const counts = new Map<string, number>();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });
  return counts;
}

export function cosineSimilarity(
  vectorA: Map<string, number>,
  vectorB: Map<string, number>
) {
  if (!vectorA.size || !vectorB.size) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  vectorA.forEach((value, key) => {
    normA += value * value;
    const otherValue = vectorB.get(key);
    if (otherValue) {
      dot += value * otherValue;
    }
  });

  vectorB.forEach((value) => {
    normB += value * value;
  });

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildSocraticResponse(question: string, chunks: ChunkRecord[]): SocraticResponse {
  const excerpt = chunks
    .map((chunk, index) => `(${index + 1}) ${chunk.text}`)
    .join("\n\n");

  const guidingPrompts = [
    "What core principle or definition might be relevant here?",
    "Which assumptions are you making that we can test?",
    "How would you explain this concept to a peer in one paragraph?",
    "What is the first small step you could solve before the full problem?",
  ];

  const questionPrompt = guidingPrompts[Math.floor(Math.random() * guidingPrompts.length)];

  return {
    response: `Let's reason it out together.\n\nHere are the most relevant notes I found:\n${excerpt}\n\nInstead of jumping to the final answer, try this:\n- Summarize the key idea from excerpt (1) in your own words.\n- Connect that idea to the question: "${question}"\n- Identify any formula, definition, or rule that anchors your reasoning.\n\n${questionPrompt}`,
    sources: chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      preview: chunk.text.slice(0, 180),
    })),
  };
}
