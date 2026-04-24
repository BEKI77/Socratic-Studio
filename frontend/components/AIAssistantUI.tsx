"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import type {
  Message,
  Conversation,
  Template,
  Folder,
  Document,
  DocumentSummary,
  CollapsedState
} from "../types/types"
import { Calendar, LayoutGrid, MoreHorizontal, Menu } from "lucide-react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import GhostIconButton from "./GhostIconButton"
import ThemeToggle from "./ThemeToggle"
import { INITIAL_TEMPLATES } from "./mockData"
import { askQuestion, fetchDocuments, uploadDocument } from "@/lib/api"
import { makeId } from "./utils"

const createSessionConversation = (): Conversation => ({
  id: makeId("c"),
  title: "Socratic Session",
  updatedAt: new Date().toISOString(),
  messageCount: 0,
  preview: "Upload notes or ask a question to begin.",
  pinned: true,
  folder: "Study Sessions",
  messages: [],
})

const INITIAL_FOLDERS: Folder[] = [{ id: "f1", name: "Study Sessions" }]

export default function AIAssistantUI() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme")
    if (saved) return saved as "light" | "dark"
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark"
    return "light"
  })

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.style.colorScheme = theme
      localStorage.setItem("theme", theme)
    } catch { }
  }, [theme])

  useEffect(() => {
    try {
      const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      if (!media) return
      const listener = (e: MediaQueryListEvent) => {
        const saved = localStorage.getItem("theme")
        if (!saved) setTheme(e.matches ? "dark" : "light")
      }
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } catch { }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<CollapsedState>(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed")
      return raw ? JSON.parse(raw) : { pinned: true, recent: false, folders: true, templates: true }
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true }
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    } catch { }
  }, [collapsed])

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state")
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed-state", JSON.stringify(sidebarCollapsed))
    } catch { }
  }, [sidebarCollapsed])

  const [initialConversation] = useState<Conversation>(() => createSessionConversation())
  const [conversations, setConversations] = useState<Conversation[]>(() => [initialConversation])
  const [selectedId, setSelectedId] = useState<string>(() => initialConversation.id)
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES)
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS)

  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadStatus, setUploadStatus] = useState<string>("Upload lecture notes to begin.")
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const [query, setQuery] = useState<string>("")
  const searchRef = useRef<HTMLInputElement>(null)

  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault()
        createNewChat()
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase()
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault()
          searchRef.current?.focus()
        }
      }
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sidebarOpen, conversations])

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      createNewChat()
    }
  }, [])

  useEffect(() => {
    fetchDocuments().then((docs: DocumentSummary[]) =>
      setDocuments(docs.map(doc => ({ ...doc, uploadedAt: new Date().toISOString() })))
    )
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [conversations, query])

  const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const recent = filtered
    .filter((c) => !c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10)

  const folderCounts = React.useMemo(() => {
    const map = Object.fromEntries(folders.map((f) => [f.name, 0]))
    for (const c of conversations) if (map[c.folder] != null) map[c.folder] += 1
    return map
  }, [conversations, folders])

  function togglePin(id: string): void {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
  }

  function createNewChat(): void {
    const id = makeId("c")
    const item: Conversation = {
      id,
      title: "New Socratic Session",
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "Upload notes or ask a question to begin.",
      pinned: false,
      folder: "Study Sessions",
      messages: [], // Ensure messages array is empty for new chats
    }
    setConversations((prev) => [item, ...prev])
    setSelectedId(id)
    setSidebarOpen(false)
  }

  function createFolder(name?: string): void {
    const proposed = name ?? prompt("Folder name")
    if (!proposed) return
    if (folders.some((f) => f.name.toLowerCase() === proposed.toLowerCase())) return alert("Folder already exists.")
    setFolders((prev) => [...prev, { id: makeId("f"), name: proposed }])
  }

  async function sendMessage(convId: string, content: string): Promise<void> {
    if (!content.trim()) return
    const now = new Date().toISOString()
    const userMsg: Message = { id: makeId("m"), role: "user" as const, content, createdAt: now }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = [...(c.messages || []), userMsg]
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        }
      }),
    )

    setIsThinking(true)
    setThinkingConvId(convId)

    try {
      const payload = await askQuestion(content)
      const normalizedSources = Array.isArray(payload.sources)
        ? payload.sources.map((source) => ({
          id: source.id,
          documentName: source.documentName || "Document",
          preview: source.preview ?? "",
        }))
        : []
      const asstMsg: Message = {
        id: makeId("m"),
        role: "assistant" as const,
        content: payload.response,
        createdAt: new Date().toISOString(),
        sources: normalizedSources,
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const msgs = [...(c.messages || []), asstMsg]
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: asstMsg.content.slice(0, 80),
          }
        }),
      )
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "Something went wrong while reasoning."
      const fallbackMsg: Message = {
        id: makeId("m"),
        role: "assistant" as const,
        content: fallback,
        createdAt: new Date().toISOString(),
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          const msgs = [...(c.messages || []), fallbackMsg]
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: fallbackMsg.content.slice(0, 80),
          }
        }),
      )
    } finally {
      setIsThinking(false)
      setThinkingConvId(null)
    }
  }

  function editMessage(convId: string, messageId: string, newContent: string): void {
    const now = new Date().toISOString()
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m,
        )
        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        }
      }),
    )
  }

  function resendMessage(convId: string, messageId: string): void {
    const conv = conversations.find((c) => c.id === convId)
    const msg = conv?.messages?.find((m) => m.id === messageId)
    if (!msg) return
    sendMessage(convId, msg.content)
  }

  function pauseThinking(): void {
    setIsThinking(false)
    setThinkingConvId(null)
  }

  function handleUseTemplate(template: Template): void {
    // This will be passed down to the Composer component
    // The Composer will handle inserting the template content
    if (composerRef.current) {
      composerRef.current.insertTemplate(template.content)
    }
  }

  const composerRef = useRef<any>(null)

  const selected = conversations.find((c) => c.id === selectedId) || null

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setUploadStatus("Indexing your material...")

    try {
      const document: DocumentSummary = await uploadDocument(file)
      setDocuments((prev) => [...prev, { ...document, uploadedAt: new Date().toISOString() }])
      setUploadStatus("Document indexed. Ask your next question.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed."
      setUploadStatus(message)
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground p-0 m-0">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-70" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[85rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent/50 via-background/40 to-accent/40 blur-3xl dark:from-background/40 dark:via-background/20 dark:to-background/40" />
      <div className="relative flex min-h-screen flex-col">
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-sidebar/70 px-4 py-2.5 backdrop-blur dark:border-border dark:bg-sidebar/70">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="inline-flex h-4 w-4 items-center justify-center">✱</span> Socratic Studio
          </div>
          <div className="ml-auto flex items-center gap-2">
            <GhostIconButton label="Schedule">
              <Calendar className="h-4 w-4" />
            </GhostIconButton>
            <GhostIconButton label="Apps">
              <LayoutGrid className="h-4 w-4" />
            </GhostIconButton>
            <GhostIconButton label="More">
              <MoreHorizontal className="h-4 w-4" />
            </GhostIconButton>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className="mx-auto flex w-full h-screen  px-0 ">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            theme={theme}
            setTheme={setTheme}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            conversations={conversations}
            pinned={pinned}
            recent={recent}
            folders={folders}
            folderCounts={folderCounts}
            selectedId={selectedId}
            onSelect={(id: string) => setSelectedId(id)}
            togglePin={togglePin}
            query={query}
            setQuery={setQuery}
            searchRef={searchRef}
            createFolder={createFolder}
            createNewChat={createNewChat}
            templates={templates}
            setTemplates={setTemplates}
            onUseTemplate={handleUseTemplate}
            documents={documents}
            uploadStatus={uploadStatus}
            isUploading={isUploading}
            onUpload={handleUpload}
          />

          <main className="relative flex min-w-0 flex-1 flex-col md:rounded-[28px] md:border md:border-border md:bg-sidebar/70 md:shadow-soft md:backdrop-blur dark:md:border-border dark:md:bg-sidebar/60">
            <Header createNewChat={createNewChat} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
            <ChatPane
              ref={composerRef}
              conversation={selected}
              onSend={async (content: string) => { if (selected) await sendMessage(selected.id, content) }}
              onEditMessage={(messageId, newContent) => selected && editMessage(selected.id, messageId, newContent)}
              onResendMessage={(messageId) => selected && resendMessage(selected.id, messageId)}
              isThinking={isThinking && thinkingConvId === selected?.id}
              onPauseThinking={pauseThinking}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
