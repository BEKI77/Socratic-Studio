"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import type {
  Message,
  Conversation,
  Template,
  Folder,
  Document,
  DocumentSummary,
  DocumentUploadResponse,
  CollapsedState
} from "../types/types"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import ThemeToggle from "./ThemeToggle"
import { INITIAL_TEMPLATES } from "./mockData"
import { askQuestion, fetchDocuments, uploadDocument, fetchChatSessions } from "@/lib/api"
import DocumentModal from "./DocumentModal"
import SettingsModal from "./SettingsModal"
import { useAuth } from "@/hooks/useAuth"
import { cls, makeId } from "./utils"

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

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

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

  const [docModalOpen, setDocModalOpen] = useState<boolean>(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false)
  const [selectedDocName, setSelectedDocName] = useState<string>("")
  const [selectedDocId, setSelectedDocId] = useState<string>("")

  const { token, logout } = useAuth()

  function handleDocumentClick(docId: string): void {
    const doc = documents.find(d => d.id === docId)
    if (doc) {
      setSelectedDocName(doc.name)
      // Passing docId here would be better, but the Modal currently 
      // uses the 'documentName' prop as the identifier. 
      // We'll update the Modal to take 'docId' for true uniqueness.
      setDocModalOpen(true)
      setSelectedDocId(docId)
    }
  }

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
    if (!token) return
    fetchDocuments(token).then((docs: DocumentSummary[]) =>
      setDocuments(docs.map(doc => ({ ...doc, uploadedAt: new Date().toISOString() })))
    )
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchChatSessions(token).then((sessions: any[]) => {
      if (sessions.length > 0) {
        setConversations(sessions.map(s => ({
          id: s.id.toString(),
          title: s.title,
          updatedAt: new Date().toISOString(),
          messageCount: s.messages.length,
          preview: s.messages[s.messages.length - 1]?.content.slice(0, 80) || "New Session",
          pinned: false,
          folder: "Study Sessions",
          messages: s.messages.map((m: any, idx: number) => ({
            id: makeId("m") + idx,
            role: m.role,
            content: m.content,
            createdAt: new Date().toISOString()
          }))
        })))
        setSelectedId(sessions[0].id.toString())
      }
    })
  }, [token])

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

  async function sendMessage(convId: string, content: string, studentSolution?: string): Promise<void> {
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
      if (!token) return
      const payload = await askQuestion(content, token, isNaN(Number(convId)) ? undefined : Number(convId), studentSolution ?? "")

      const asstMsg: Message = {
        id: makeId("m"),
        role: "assistant" as const,
        content: payload.content,
        createdAt: new Date().toISOString(),
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
      if (!token) return
      const result: DocumentUploadResponse = await uploadDocument(file, token)

      // Update local state with the new document immediately
      // The result now matches the DocumentSummary / Document structure
      const newDoc: Document = {
        ...result,
        uploadedAt: new Date().toISOString()
      }

      setDocuments((prev) => [...prev, newDoc])
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
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.55_0.18_245/0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-[0.03] dark:opacity-[0.08]" />
      <div className="pointer-events-none absolute top-[-40%] left-1/2 h-250 w-250 -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="relative flex min-h-screen flex-col">
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <span className="text-xs">✱</span>
            </div>
            <span className="text-gradient">Socratic Studio</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className="mx-auto flex w-full h-screen overflow-hidden px-0 md:p-4 lg:p-6">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel
              defaultSize={20}
              minSize={sidebarCollapsed ? 4 : 15}
              maxSize={30}
              className={cls(
                "hidden md:block h-full transition-all duration-300",
                sidebarCollapsed ? "max-w-16" : ""
              )}
            >
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
                onDocumentClick={handleDocumentClick}
              />
            </ResizablePanel>

            <ResizableHandle className="hidden md:flex" />

            <ResizablePanel defaultSize={80}>
              <main className="relative flex h-full min-w-0 flex-col overflow-hidden glass md:rounded-4xl">
                <Header
                  createNewChat={createNewChat}
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarOpen={setSidebarOpen}
                  onOpenSettings={() => setSettingsModalOpen(true)}
                />
                <ChatPane
                  ref={composerRef}
                  conversation={selected}
                  onSend={async (content: string, studentSolution?: string) => { if (selected) await sendMessage(selected.id, content, studentSolution) }}
                  onEditMessage={(messageId, newContent) => selected && editMessage(selected.id, messageId, newContent)}
                  onResendMessage={(messageId) => selected && resendMessage(selected.id, messageId)}
                  isThinking={isThinking && thinkingConvId === selected?.id}
                  onPauseThinking={pauseThinking}
                />
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <DocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        documentName={selectedDocName}
        documentId={selectedDocId}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </div>
  )
}
