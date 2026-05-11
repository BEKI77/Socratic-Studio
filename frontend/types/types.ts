export interface Message {
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

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  messageCount: number
  preview: string
  pinned: boolean
  folder: string
  messages: Message[]
}

export interface Template {
  id: string
  name: string
  content: string
  category?: string
  snippet?: string
  createdAt?: string
  updatedAt?: string
}

export interface Folder {
  id: string
  name: string
}

export interface Document {
  id: string
  name: string
  chunkCount: number
  uploadedAt: string
}

export interface DocumentUploadResponse {
  id: string
  name: string
  chunkCount: number
  status: string
}

export interface DocumentSummary {
  id: string
  name: string
  chunkCount: number
}

export interface CollapsedState {
  pinned: boolean
  recent: boolean
  folders: boolean
  templates: boolean
}

// Component Props Interfaces
export interface SidebarProps {
  open: boolean
  onClose: () => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  collapsed: CollapsedState
  setCollapsed: React.Dispatch<React.SetStateAction<CollapsedState>>
  conversations: Conversation[]
  pinned: Conversation[]
  recent: Conversation[]
  folders: Folder[]
  folderCounts: Record<string, number>
  selectedId: string
  onSelect: (id: string) => void
  togglePin: (id: string) => void
  query: string
  setQuery: (query: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  createFolder: (name?: string) => void
  createNewChat: () => void
  templates?: Template[]
  setTemplates?: React.Dispatch<React.SetStateAction<Template[]>>
  onUseTemplate?: (template: Template) => void
  sidebarCollapsed?: boolean
  setSidebarCollapsed?: React.Dispatch<React.SetStateAction<boolean>>
  documents: Document[]
  uploadStatus?: string
  isUploading?: boolean
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDocumentClick?: (documentName: string) => void
}

export interface ConversationRowProps {
  data: Conversation
  active: boolean
  onSelect: () => void
  onTogglePin: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  showMeta?: boolean
}

export interface FolderRowProps {
  name: string
  count: number
  conversations: any[]
  selectedId: string
  onSelect: (id: string) => void
  togglePin: (id: string) => void
  onDeleteFolder: (name: string) => void
  onRenameFolder: (oldName: string, newName: string) => void
}

export interface TemplateRowProps {
  template: Template
  onUseTemplate: (template: Template) => void
  onEditTemplate: (template: Template) => void
  onRenameTemplate: (templateId: string, newName: string) => void
  onDeleteTemplate: (templateId: string) => void
}

export interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (folderName: string) => void
}

export interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTemplate: (template: Omit<Template, 'id'> & { id?: string }) => void
  editingTemplate?: Template | null
}

export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  conversations: Conversation[]
  selectedId: string
  onSelect: (id: string) => void
  togglePin: (id: string) => void
  createNewChat: () => void
}

export interface SidebarSectionProps {
  icon: React.ReactNode
  title: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
}

export interface ThemeToggleProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export interface MessageProps {
  role: "user" | "assistant"
  children: React.ReactNode
}

export interface HeaderProps {
  createNewChat: () => void
  sidebarCollapsed: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export interface GhostIconButtonProps {
  label: string
  children: React.ReactNode
}

export interface SettingsPopoverProps {
  children: React.ReactNode
}

// Action interfaces for ComposerActionsPopover
export interface Action {
  action: string
  label: string
  icon: React.ComponentType<{ className?: string }> | React.ReactNode
}

export interface ComposerActionsPopoverProps {
  children: React.ReactNode
  actions: Action[]
}
