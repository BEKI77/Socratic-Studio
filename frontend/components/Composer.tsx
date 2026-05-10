"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect, ForwardedRef } from "react"
import { Send, Loader2, Plus, Mic } from "lucide-react"
import ComposerActionsPopover from "./ComposerActionsPopover"
import { cls } from "./utils"

interface ComposerProps {
  onSend?: (text: string) => Promise<void>
  busy: boolean
}

interface ComposerRef {
  insertTemplate: (templateContent: string) => void
  focus: () => void
}

const Composer = forwardRef<ComposerRef, ComposerProps>(function Composer({ onSend, busy }, ref: ForwardedRef<ComposerRef>) {
  const [value, setValue] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)
  const [lineCount, setLineCount] = useState<number>(1)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    <div className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-10">
      <div
        className={cls(
          "mx-auto flex flex-col rounded-[28px] border transition-all duration-300 glass shadow-2xl",
          "max-w-3xl border-border/40 hover:border-primary/30 group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
        )}
      >
        <div className="flex-1 px-5 pt-5 pb-3">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            rows={1}
            className={cls(
              "w-full resize-none bg-transparent text-[16px] outline-none placeholder:text-muted-foreground/50 transition-all duration-200",
              "min-h-[28px] text-left leading-relaxed font-medium",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-1">
            <ComposerActionsPopover>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
                title="Tools"
              >
                <Plus className="h-5 w-5" />
              </button>
            </ComposerActionsPopover>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
              title="Voice"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={sending || busy || !hasContent}
              className={cls(
                "inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                hasContent
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed opacity-50",
              )}
            >
              {sending || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-3xl px-2 text-center text-[12px] font-medium text-muted-foreground/60">
        Socratic Studio is here to guide you through hints and reflective questions.
      </div>
    </div>
  )
})

export default Composer
