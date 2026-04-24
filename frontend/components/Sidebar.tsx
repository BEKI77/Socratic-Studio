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
  Settings,
  Asterisk,
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
  Message,
  Conversation,
  Template,
  Folder,
  Document,
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

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleRenameTemplate = (templateId: string, newName: string) => {
    const updatedTemplates = templates.map((t: Template) =>
      t.id === templateId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t,
    )
    setTemplates(updatedTemplates)
  }

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t: Template) => t.id !== templateId)
    setTemplates(updatedTemplates)
  }

  const handleUseTemplate = (template: Template) => {
    onUseTemplate(template)
  }

  if (sidebarCollapsed) {
    return (
      <>
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: 64 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="z-50 flex h-full shrink-0 flex-col border-r border-border bg-sidebar dark:border-border dark:bg-sidebar"
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
              "z-50 flex h-full w-[min(20rem,88vw)] shrink-0 flex-col border-r border-border bg-sidebar/85 backdrop-blur dark:border-border dark:bg-sidebar/80 sm:w-80",
              "fixed inset-y-0 left-0 md:static md:translate-x-0",
            )}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-3 dark:border-border">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary text-primary-foreground shadow-sm dark:from-primary dark:to-primary dark:text-primary-foreground">
                  <Asterisk className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold tracking-tight">Socratic Studio</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:block rounded-xl p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>

                <button
                  onClick={onClose}
                  className="md:hidden rounded-xl p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent"
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                Search conversations
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring dark:border-input dark:bg-background"
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-primary dark:text-primary-foreground"
                title="New Chat (⌘N)"
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            <div className="px-3 pt-3">
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm dark:border-border dark:bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground dark:text-muted-foreground">
                      Knowledge base
                    </div>
                    <div className="text-sm font-semibold">Upload notes</div>
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground dark:border-border dark:text-muted-foreground">
                    PDF · TXT · TEX
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">{uploadStatus}</p>
                <div className="mt-3">
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.txt,.tex"
                    className="sr-only"
                    onChange={onUpload}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="doc-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent dark:bg-background dark:text-foreground dark:hover:bg-accent"
                  >
                    <Plus className="h-3.5 w-3.5" /> {isUploading ? "Uploading..." : "Add material"}
                  </label>
                </div>
                <div className="mt-3 space-y-1">
                  {documents.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No documents indexed yet.</p>
                  ) : (
                    documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground"
                      >
                        <span className="truncate">{doc.name}</span>
                        <span className="text-[10px] text-muted-foreground">{doc.chunkCount} chunks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title="PINNED CHATS"
                collapsed={collapsed.pinned}
                onToggle={() => setCollapsed((s: CollapsedState) => ({ ...s, pinned: !s.pinned }))}
              >
                {pinned.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground dark:border-border dark:text-muted-foreground">
                    Pin important threads for quick access.
                  </div>
                ) : (
                  pinned.map((c: Conversation) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed((s: CollapsedState) => ({ ...s, recent: !s.recent }))}
              >
                {recent.length === 0 ? (
                  <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground dark:border-border dark:text-muted-foreground">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((c: Conversation) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => onSelect(c.id)}
                      onTogglePin={() => togglePin(c.id)}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed((s: CollapsedState) => ({ ...s, folders: !s.folders }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent dark:text-muted-foreground dark:hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" /> Create folder
                  </button>

                  {folders.map((f: Folder) => (
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

              <SidebarSection
                icon={<FileText className="h-4 w-4" />}
                title="TEMPLATES"
                collapsed={collapsed.templates}
                onToggle={() => setCollapsed((s: CollapsedState) => ({ ...s, templates: !s.templates }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent dark:text-muted-foreground dark:hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" /> Create template
                  </button>

                  {(Array.isArray(templates) ? templates : []).map((template: Template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onUseTemplate={handleUseTemplate}
                      onEditTemplate={handleEditTemplate}
                      onRenameTemplate={handleRenameTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  ))}

                  {(!templates || templates.length === 0) && (
                    <div className="select-none rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground dark:border-border dark:text-muted-foreground">
                      No templates yet. Create your first prompt template.
                    </div>
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="mt-auto border-t border-border px-3 py-3 dark:border-border">
              <div className="flex items-center gap-2">
                <SettingsPopover>
                  <button className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                </SettingsPopover>
                <div className="ml-auto">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-card p-2 dark:bg-card">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground dark:bg-primary dark:text-primary-foreground">
                  ST
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">Student</div>
                  <div className="truncate text-xs text-muted-foreground dark:text-muted-foreground">Study workspace</div>
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
