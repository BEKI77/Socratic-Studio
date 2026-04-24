import { makeId } from "./utils"

export const INITIAL_CONVERSATIONS = [
  {
    id: "c1",
    title: "Marketing plan for launch",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messageCount: 12,
    preview: "Drafting a 4-week GTM plan with channels, KPIs, and budget...",
    pinned: true,
    folder: "Work Projects",
    messages: [
      {
        id: makeId("m"),
        role: "user",
        content: "Draft a 4-week GTM plan.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: makeId("m"),
        role: "assistant",
        content: "Sure — phases, owners, risks, and KPIs coming up.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString(),
      },
    ],
  },
  {
    id: "c2",
    title: "Research: vector databases vs RAG",
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    messageCount: 22,
    preview: "Compare pgvector, Milvus, and Weaviate. Cost + latency notes...",
    pinned: false,
    folder: "Code Reviews",
    messages: [],
  },
  {
    id: "c3",
    title: "Trip checklist – Paris with family",
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 9,
    preview: "Packing list, museum tickets, metro pass options, and cafés...",
    pinned: false,
    folder: "Personal",
    messages: [],
  },
  {
    id: "c4",
    title: "Refactor prompt templates for support",
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messageCount: 17,
    preview: "Turn macros into reusable templates with variables and guardrails...",
    pinned: true,
    folder: "Work Projects",
    messages: [],
  },
  {
    id: "c5",
    title: "Bug triage notes",
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    messageCount: 6,
    preview: "Priorities: login rate limit, streaming flicker, retry policy...",
    pinned: false,
    folder: "Work Projects",
    messages: [],
  },
  {
    id: "c6",
    title: "AI agent: inbox clean-up flow",
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    messageCount: 31,
    preview: "Classifier → summarize → bulk actions with undo and logs...",
    pinned: false,
    folder: "Work Projects",
    messages: [],
  },
  {
    id: "c7",
    title: "Weekly review – personal goals",
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    messageCount: 8,
    preview: "Sleep routine, gym cadence, reading list, dopamine detox...",
    pinned: false,
    folder: "Personal",
    messages: [],
  },
  {
    id: "c8",
    title: "Code review: message composer",
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    messageCount: 14,
    preview: "Edge cases: IME input, paste images, drag-n-drop, retries...",
    pinned: false,
    folder: "Code Reviews",
    messages: [],
  },
  {
    id: "c9",
    title: "LLM evals – rubric + dataset",
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    messageCount: 40,
    preview: "BLEU vs human eval, task matrix, hallucination checks...",
    pinned: false,
    folder: "Work Projects",
    messages: [],
  },
  {
    id: "c10",
    title: "Prompt library – onboarding",
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messageCount: 11,
    preview: "Create intro prompts for HR, IT, and support with guardrails...",
    pinned: false,
    folder: "Work Projects",
    messages: [],
  },
  {
    id: "c11",
    title: "Grocery budgeting – monthly",
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    messageCount: 5,
    preview: "Track cost per meal, reduce waste, and plan bulk buys...",
    pinned: false,
    folder: "Personal",
    messages: [],
  },
]

export const INITIAL_TEMPLATES = [
  {
    id: "t1",
    name: "Socratic Breakdown",
    content: `**Socratic Breakdown**

**Question:**
[Restate the question]

**Given / Known:**
-

**Goal / Unknown:**
-

**First Principle to Apply:**
-

**Next Small Step:**
-

**Check Your Work:**
-`,
    snippet: "Step-by-step Socratic breakdown of a problem statement...",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t2",
    name: "Derivation Check",
    content: `**Derivation Check**

**Target Result:**
[What are we trying to derive?]

**Key Definitions:**
-

**Step I'm Unsure About:**
-

**Assumption to Verify:**
-

**Alternative Path:**
-`,
    snippet: "Use this to isolate the exact step where a derivation fails...",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t3",
    name: "Concept Map",
    content: `**Concept Map**

**Core Concept:**
-

**Related Laws / Theorems:**
-

**Typical Mistakes:**
-

**Example Problem:**
-

**Self-Check Question:**
-`,
    snippet: "Structure a topic into definitions, laws, and self-checks...",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const INITIAL_FOLDERS = [
  { id: "f1", name: "Work Projects" },
  { id: "f2", name: "Personal" },
  { id: "f3", name: "Code Reviews" },
]
