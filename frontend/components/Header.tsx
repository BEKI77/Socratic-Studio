"use client"
import { Asterisk, MoreHorizontal, Menu, ChevronDown, LogOut } from "lucide-react"
import { useState } from "react"
import GhostIconButton from "./GhostIconButton"
import { useAuth } from "@/hooks/useAuth"
import { cls } from "./utils"

interface HeaderProps {
  createNewChat: () => void
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  onOpenSettings: () => void
}

export default function Header({ createNewChat, sidebarCollapsed, setSidebarOpen, onOpenSettings }: HeaderProps) {
  const [selectedBot, setSelectedBot] = useState("Socratic Tutor")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { logout } = useAuth()

  const chatbots = [
    { name: "Socratic Tutor", icon: "�" },
    { name: "Concept Coach", icon: "📚" },
    { name: "Problem Solver", icon: "🧠" },
    { name: "Exam Prep", icon: <Asterisk className="h-4 w-4" /> },
  ]

  return (
    <div className="sticky top-0 z-30 flex h-20 items-center gap-4 px-6 sm:px-8 bg-transparent">
      <div className="flex md:hidden items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Asterisk className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gradient">Socratic</span>
      </div>

      <div className="hidden md:flex relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group inline-flex items-center gap-3 rounded-2xl border border-border/40 bg-background/40 px-5 py-2.5 text-sm font-bold tracking-tight shadow-sm backdrop-blur-sm transition-all hover:bg-background/80 hover:border-primary/30"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {typeof chatbots.find((bot) => bot.name === selectedBot)?.icon === "string" ? (
              <span className="text-xs">{chatbots.find((bot) => bot.name === selectedBot)?.icon}</span>
            ) : (
              chatbots.find((bot) => bot.name === selectedBot)?.icon
            )}
          </div>
          {selectedBot}
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 rounded-3xl border border-border/40 glass p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            {chatbots.map((bot) => (
              <button
                key={bot.name}
                onClick={() => {
                  setSelectedBot(bot.name)
                  setIsDropdownOpen(false)
                }}
                className={cls(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-left rounded-2xl transition-all duration-200",
                  selectedBot === bot.name ? "bg-primary/10 text-primary" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cls(
                  "flex h-7 w-7 items-center justify-center rounded-xl transition-colors",
                  selectedBot === bot.name ? "bg-primary text-primary-foreground" : "bg-accent/50"
                )}>
                  {typeof bot.icon === "string" ? <span className="text-sm">{bot.icon}</span> : bot.icon}
                </div>
                <span className="font-bold">{bot.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-accent/30 border border-border/20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Live Engine</span>
        </div>
        <button
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <button
          onClick={onOpenSettings}
          className="flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-accent/50 transition-colors text-muted-foreground"
          title="Settings"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>

  )
}
