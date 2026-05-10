"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect, ForwardedRef } from "react"
import { Send, Loader2, Plus, Mic, X } from "lucide-react"
import { cls } from "./utils"
import type { Document } from "../types/types"

interface ComposerProps {
  onSend?: (text: string) => Promise<void>
  onUploadFile?: (file: File) => Promise<void> | void
  onRemoveDocument?: (id: string) => void
  documents?: Document[]
  busy: boolean
}

interface ComposerRef {
  insertTemplate: (templateContent: string) => void
  focus: () => void
}

const Composer = forwardRef<ComposerRef, ComposerProps>(function Composer({ onSend, onUploadFile, onRemoveDocument, documents = [], busy }, ref: ForwardedRef<ComposerRef>) {
  const [value, setValue] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)
  const [lineCount, setLineCount] = useState<number>(1)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ""

    try {
      await onUploadFile?.(file)
    } catch (error) {
      console.error("Upload failed", error)
    }
  }

  const openFilePicker = () => {
    uploadInputRef.current?.click()
  }

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current
      const lineHeight = 24
      const minHeight = 24

      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const calculatedLines = Math.max(1, Math.ceil(scrollHeight / lineHeight))

      setLineCount(calculatedLines)

      if (calculatedLines <= 12) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
        textarea.style.overflowY = "hidden"
      } else {
        textarea.style.height = `${12 * lineHeight}px`
        textarea.style.overflowY = "auto"
      }
    }
  }, [value])

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        setValue((prev) => {
          const newValue = prev ? `${prev}\n\n${templateContent}` : templateContent
          setTimeout(() => {
            inputRef.current?.focus()
            const length = newValue.length
            inputRef.current?.setSelectionRange(length, length)
          }, 0)
          return newValue
        })
      },
      focus: () => {
        inputRef.current?.focus()
      },
    }),
    [],
  )

  async function handleSend(): Promise<void> {
    if (!value.trim() || sending) return
    setSending(true)
    try {
      await onSend?.(value)
      setValue("")
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <div className="border-t border-zinc-200/60 px-4 py-4 sm:px-6 dark:border-zinc-800">
      <input
        ref={uploadInputRef}
        type="file"
        hidden
        onChange={handleFileInputChange}
      />
      <div
        className={cls(
          "mx-auto flex flex-col rounded-3xl border bg-white/90 shadow-sm backdrop-blur dark:bg-zinc-950/90 transition-all duration-200",
          "max-w-3xl border-zinc-200/80 dark:border-zinc-800",
        )}
      >
        {/* Textarea area - grows upward */}
        <div className="flex-1 px-4 pt-4 pb-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask a concept question or request a hint..."
            rows={1}
            className={cls(
              "w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400 transition-all duration-200",
              "min-h-[24px] text-left leading-6",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        {/* Bottom toolbar: + on left, mic/send on right */}
        <div className="flex items-center justify-between px-3 pb-3">
          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex shrink-0 items-center justify-center rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            title="Add attachment"
          >
            <Plus className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
              title="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={sending || busy || !hasContent}
              className={cls(
                "inline-flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors",
                hasContent
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed",
              )}
            >
              {sending || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="border-t border-zinc-200/70 px-4 pt-3 pb-2 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <span>Attached materials</span>
              <span className="text-[11px] text-zinc-400">{documents.length} file{documents.length === 1 ? "" : "s"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300"
                >
                  <span className="truncate max-w-[200px]">{doc.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveDocument?.(doc.id)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={`Remove ${doc.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mt-4 max-w-3xl px-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Socratic responses are hints, not final answers.
      </div>
    </div>
  )
})

export default Composer
