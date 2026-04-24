"use client"

import { useState, forwardRef, useImperativeHandle, useRef, ForwardedRef } from "react"
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react"
import Message from "./Message"
import Composer from "./Composer"
import { cls, timeAgo } from "./utils"

interface ThinkingMessageProps {
  onPause: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  editedAt?: string
  sources?: Array<{
    id: string
    documentName: string
    preview: string
  }>
}

interface Conversation {
  id: string
  title: string
  updatedAt: string
  messageCount: number
  preview: string
  pinned: boolean
  folder: string
  messages: Message[]
}

interface ChatPaneProps {
  conversation: Conversation | null
  onSend?: (content: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => void
  onResendMessage?: (messageId: string) => void
  isThinking: boolean
  onPauseThinking: () => void
}

interface ChatPaneRef {
  insertTemplate: (templateContent: string) => void
}

function ThinkingMessage({ onPause }: ThinkingMessageProps) {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">AI is thinking...</span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  )
}

const ChatPane = forwardRef<ChatPaneRef, ChatPaneProps>(function ChatPane(
  { conversation, onSend, onEditMessage, onResendMessage, isThinking, onPauseThinking },
  ref: ForwardedRef<ChatPaneRef>,
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>("")
  const [busy, setBusy] = useState<boolean>(false)
  const composerRef = useRef<any>(null)

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        composerRef.current?.insertTemplate(templateContent)
      },
    }),
    [],
  )

  if (!conversation) return null

  const tags = ["Socratic", "Concept-first", "Hint-based", "Reflective"]
  const messages = Array.isArray(conversation.messages) ? conversation.messages : []
  const count = messages.length || conversation.messageCount || 0

  function startEdit(m: Message): void {
    setEditingId(m.id)
    setDraft(m.content)
  }
  function cancelEdit(): void {
    setEditingId(null)
    setDraft("")
  }
  function saveEdit(): void {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    cancelEdit()
  }
  function saveAndResend(): void {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    onResendMessage?.(editingId)
    cancelEdit()
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
            <span className="block leading-[1.08]">{conversation.title}</span>
          </div>
          <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Updated {timeAgo(conversation.updatedAt)} · {count} messages
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-5 dark:border-zinc-800">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-400">
            No messages yet. Upload notes or ask a question to begin.
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {editingId === m.id ? (
                  <div className={cls("rounded-2xl border bg-white/70 p-2 shadow-sm", "border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60")}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      rows={3}
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-900"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Save & Resend
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <Message role={m.role}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    {m.role === "assistant" && Array.isArray(m.sources) && m.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400">Sources</div>
                        {m.sources.map((source) => (
                          <div
                            key={source.id}
                            className="rounded-xl border border-zinc-200 bg-white/80 p-2 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                          >
                            <div className="font-semibold text-zinc-700 dark:text-zinc-200">
                              {source.documentName}
                            </div>
                            {source.preview && (
                              <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                {source.preview}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {m.role === "user" && (
                      <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                        <button className="inline-flex items-center gap-1 hover:underline" onClick={() => startEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 hover:underline"
                          onClick={() => onResendMessage?.(m.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Resend
                        </button>
                      </div>
                    )}
                  </Message>
                )}
              </div>
            ))}
            {isThinking && <ThinkingMessage onPause={onPauseThinking} />}
          </div>
        )}
      </div>

      <Composer
        ref={composerRef}
        onSend={async (text) => {
          if (!text.trim()) return
          setBusy(true)
          await onSend?.(text)
          setBusy(false)
        }}
        busy={busy}
      />
    </div>
  )
})

export default ChatPane
