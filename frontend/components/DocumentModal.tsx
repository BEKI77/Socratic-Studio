"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Hash, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchDocumentChunks } from "@/lib/api"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentName: string
}

interface Chunk {
  content: string
  chunkIndex: number
  source: string
  page: number | null
}

export default function DocumentModal({ isOpen, onClose, documentName }: DocumentModalProps) {
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeChunk, setActiveChunk] = useState<number>(0)

  useEffect(() => {
    if (isOpen && documentName) {
      setIsLoading(true)
      setError(null)
      setActiveChunk(0)
      fetchDocumentChunks(documentName)
        .then((data) => {
          setChunks(data.chunks)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load document.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, documentName])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold truncate">{documentName}</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : `${chunks.length} chunk${chunks.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-accent/50 transition-colors text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[60vh]">
              {/* Chunk sidebar */}
              {chunks.length > 1 && (
                <div className="w-48 shrink-0 border-r border-border overflow-y-auto py-2 custom-scrollbar">
                  {chunks.map((chunk, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChunk(idx)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        idx === activeChunk
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent/30"
                      }`}
                    >
                      <Hash className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        Chunk {idx + 1}
                        {chunk.page !== null && ` · p.${chunk.page}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chunk content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm">Loading document...</p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {!isLoading && !error && chunks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                    <BookOpen className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No chunks found for this document.</p>
                  </div>
                )}

                {!isLoading && !error && chunks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        Chunk {activeChunk + 1} of {chunks.length}
                      </span>
                      {chunks[activeChunk]?.page !== null && (
                        <span className="text-xs text-muted-foreground">
                          Page {chunks[activeChunk]?.page}
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {chunks[activeChunk]?.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with navigation */}
            {!isLoading && chunks.length > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <button
                  onClick={() => setActiveChunk(Math.max(0, activeChunk - 1))}
                  disabled={activeChunk === 0}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-xs text-muted-foreground">
                  {activeChunk + 1} / {chunks.length}
                </span>
                <button
                  onClick={() => setActiveChunk(Math.min(chunks.length - 1, activeChunk + 1))}
                  disabled={activeChunk === chunks.length - 1}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
