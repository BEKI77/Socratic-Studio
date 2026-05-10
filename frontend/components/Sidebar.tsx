"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  Star,
  Clock,
  FolderIcon,
  FileText,
  BookOpen,
  Settings,
  Asterisk,
  Loader2,
} from "lucide-react"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import FolderRow from "./FolderRow"
import TemplateRow from "./TemplateRow"
import ThemeToggle from "./ThemeToggle"
import CreateFolderModal from "./CreateFolderModal"
import CreateTemplateModal from "./CreateTemplateModal"
import SearchModal from "./SearchModal"
import SettingsPopover from "./SettingsPopover"
import { cls, makeId } from "./utils"
import { useEffect, useState, useRef } from "react"
import type {
  Conversation,
  Template,
  CollapsedState,
  SidebarProps
} from "../types/types"

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  createNewChat,
  templates = [],
  setTemplates = () => { },
  onUseTemplate = () => { },
  sidebarCollapsed = false,
  setSidebarCollapsed = () => { },
  documents = [],
  uploadStatus = "",
  isUploading = false,
  onUpload = () => { },
  onDocumentClick = () => { },
}: SidebarProps) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(min-width: 768px)").matches
  })
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showSearchModal, setShowSearchModal] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(min-width: 768px)")
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    setIsDesktop(media.matches)
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [])

  const handleSearchClick = () => {
    setShowSearchModal(true)
  }

  const handleNewChatClick = () => {
    createNewChat()
  }

  const handleFoldersClick = () => {
    setSidebarCollapsed(false)
    setCollapsed((s: CollapsedState) => ({ ...s, folders: false }))
  }

  const getConversationsByFolder = (folderName: string) => {
    return conversations.filter((conv) => conv.folder === folderName)
  }

  const handleCreateFolder = (folderName: string) => {
    createFolder(folderName)
  }

  const handleDeleteFolder = (folderName: string) => {
    const updatedConversations = conversations.map((conv: Conversation) =>
      conv.folder === folderName ? { ...conv, folder: null } : conv,
    )
    console.log("Delete folder:", folderName, "Updated conversations:", updatedConversations)
  }

  const handleRenameFolder = (oldName: string, newName: string) => {
    const updatedConversations = conversations.map((conv: Conversation) =>
      conv.folder === oldName ? { ...conv, folder: newName } : conv,
    )
    console.log("Rename folder:", oldName, "to", newName, "Updated conversations:", updatedConversations)
  }

  const handleCreateTemplate = (templateData: Omit<Template, 'id'> & { id?: string }) => {
    if (editingTemplate) {
      const updatedTemplates = templates.map((t: Template) =>
        t.id === editingTemplate.id ? { ...templateData, id: editingTemplate.id } : t,
      )
      setTemplates(updatedTemplates)
    } else {
      const newTemplate = { ...templateData, id: makeId("t") }
      const updatedTemplates = [...templates, newTemplate]
      setTemplates(updatedTemplates)
    }
    setShowCreateTemplateModal(false)
    setEditingTemplate(null)
  }


  if (sidebarCollapsed) {
    return (
      <>
        <motion.aside
          initial={{ width: "auto" }}
          animate={{ width: sidebarCollapsed ? 64 : "auto" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="z-50 flex h-full w-full shrink-0 flex-col border-r border-border bg-sidebar dark:border-border dark:bg-sidebar"
        >
          <div className="flex items-center justify-center border-b border-border px-3 py-3 dark:border-border">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="rounded-xl p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 pt-4">
            <button
              onClick={handleNewChatClick}
              className="rounded-xl p-2.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent transition-colors"
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={handleSearchClick}
              className="rounded-xl p-2.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent transition-colors"
              title="Search chats"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <button
              onClick={handleFoldersClick}
              className="rounded-xl p-2.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent transition-colors"
              title="Folders"
            >
              <FolderIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2 pb-4">
            <SettingsPopover>
              <button
                className="rounded-xl p-2.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </SettingsPopover>
          </div>
        </motion.aside>

        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          togglePin={togglePin}
          createNewChat={createNewChat}
        />
      </>
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            key="sidebar"
            initial={isDesktop ? false : { x: "-100%" }}
            animate={{ x: isDesktop ? 0 : open ? 0 : "-100%" }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className={cls(
              "z-50 flex h-full w-full shrink-0 flex-col bg-background/40 backdrop-blur-3xl",
              "fixed inset-y-0 left-0 md:static md:translate-x-0 md:bg-transparent md:border-none",
            )}
          >
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Asterisk className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gradient">Socratic</span>
              </div>
              <button
                onClick={isDesktop ? () => setSidebarCollapsed(true) : onClose}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* Main Action Area */}
            <div className="px-4 space-y-3 mb-6">
              <button
                onClick={createNewChat}
                className="group relative flex w-full items-center gap-3 rounded-2xl bg-primary px-5 py-3 text-[14px] font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span>New Session</span>
              </button>

              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Quick search..."
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full h-11 rounded-xl bg-accent/30 border-none pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <nav className="flex-1 overflow-y-auto px-2 space-y-2 pb-6 custom-scrollbar">
              {/* Consolidated Conversations */}
              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="History"
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed(s => ({ ...s, recent: !s.recent }))}
              >
                <div className="space-y-1">
                  {pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))}
                  {recent.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))}
                  {conversations.length === 0 && (
                    <p className="px-4 py-3 text-xs text-muted-foreground/60 italic text-center">No history yet</p>
                  )}
                </div>
              </SidebarSection>

              {/* Collections / Folders */}
              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="Collections"
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed(s => ({ ...s, folders: !s.folders }))}
              >
                <div className="space-y-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs font-bold text-muted-foreground/70 hover:text-primary transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> New Collection
                  </button>
                  {folders.map((f) => (
                    <FolderRow
                      key={f.id}
                      name={f.name}
                      count={folderCounts[f.name] || 0}
                      conversations={getConversationsByFolder(f.name)}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      togglePin={togglePin}
                      onDeleteFolder={handleDeleteFolder}
                      onRenameFolder={handleRenameFolder}
                    />
                  ))}
                </div>
              </SidebarSection>

              {/* Resources / Knowledge Base */}
              <SidebarSection
                icon={<BookOpen className="h-4 w-4" />}
                title="Library"
                collapsed={collapsed.templates} // Reusing state for Library
                onToggle={() => setCollapsed(s => ({ ...s, templates: !s.templates }))}
              >
                <div className="px-2 space-y-3">
                  <div className="relative">
                    <input
                      id="doc-upload"
                      type="file"
                      accept=".pdf,.txt"
                      className="sr-only"
                      onChange={onUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="doc-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent/40 py-2 text-[11px] font-bold hover:bg-accent transition-colors"
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      Add Document
                    </label>
                  </div>
                  <div className="space-y-1">
                    {documents.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => onDocumentClick(doc.name)}
                        className="flex w-full items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-accent/30 text-[11px] text-muted-foreground group text-left transition-colors"
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate flex-1">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </SidebarSection>
            </nav>

            {/* Bottom Section - Minimal Profile */}
            <div className="px-4 py-4 border-t border-border/20 bg-background/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <SettingsPopover>
                  <button className="flex items-center gap-3 group transition-all">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary text-[12px] font-bold text-white shadow-lg shadow-primary/20">
                      ST
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] font-bold text-foreground">Student</div>
                      <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">Workspace</div>
                    </div>
                  </button>
                </SettingsPopover>
                <div className="flex items-center gap-1">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>


      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false)
          setEditingTemplate(null)
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  )
}
