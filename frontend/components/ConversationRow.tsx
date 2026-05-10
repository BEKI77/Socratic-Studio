"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react"
import { cls, timeAgo } from "./utils"
import { motion, AnimatePresence } from "framer-motion"
import type { Message, Conversation, ConversationRowProps } from "../types/types"

export default function ConversationRow({ data, active, onSelect, onTogglePin, onDelete, onRename, showMeta }: ConversationRowProps) {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const count = Array.isArray(data.messages) ? data.messages.length : data.messageCount

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePin?.()
    setShowMenu(false)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newName = prompt(`Rename chat "${data.title}" to:`, data.title)
    if (newName && newName.trim() && newName !== data.title) {
      onRename?.(data.id, newName.trim())
    }
    setShowMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
      onDelete?.(data.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="group relative">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect()
          }
        }}
        className={cls(
          "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          active
            ? "bg-primary/10 text-primary shadow-sm"
            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
        )}
        title={data.title}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 truncate">
              {data.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
              <span className={cls("truncate text-[14px] tracking-tight", active ? "font-bold" : "font-medium")}>
                {data.title}
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-bold opacity-60">{timeAgo(data.updatedAt)}</span>
          </div>
          <div className="truncate text-[11px] opacity-60">
            {count} messages · {data.preview.slice(0, 40)}...
          </div>
        </div>


        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="rounded-md p-1 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60 focus-visible:opacity-100"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-[100]"
              >
                <button
                  onClick={handlePin}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  {data.pinned ? (
                    <>
                      <Pin className="h-3 w-3" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-3 w-3" />
                      Pin
                    </>
                  )}
                </button>
                <button
                  onClick={handleRename}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Edit3 className="h-3 w-3" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute left-[calc(100%+12px)] top-0 hidden w-72 rounded-2xl border border-border/40 glass p-4 text-[13px] leading-relaxed text-foreground shadow-2xl z-[60] md:group-hover:block animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="line-clamp-6">{data.preview}</div>
      </div>
    </div>
  )
}
