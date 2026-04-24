"use client"
import { Asterisk, MoreHorizontal, Menu, ChevronDown } from "lucide-react"
import { useState } from "react"
import GhostIconButton from "./GhostIconButton"

interface HeaderProps {
  createNewChat: () => void
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ createNewChat, sidebarCollapsed, setSidebarOpen }: HeaderProps) {
  const [selectedBot, setSelectedBot] = useState("Socratic Tutor")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const chatbots = [
    { name: "Socratic Tutor", icon: "�" },
    { name: "Concept Coach", icon: "📚" },
    { name: "Problem Solver", icon: "🧠" },
    { name: "Exam Prep", icon: <Asterisk className="h-4 w-4" /> },
  ]

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-sidebar/70 px-4 py-3 backdrop-blur dark:border-border dark:bg-sidebar/70 sm:px-6">
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="hidden md:flex relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-sidebar/90 px-3 py-2 text-sm font-semibold tracking-tight shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-sidebar/80 dark:hover:bg-accent"
        >
          {typeof chatbots.find((bot) => bot.name === selectedBot)?.icon === "string" ? (
            <span className="text-sm">{chatbots.find((bot) => bot.name === selectedBot)?.icon}</span>
          ) : (
            chatbots.find((bot) => bot.name === selectedBot)?.icon
          )}
          {selectedBot}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-border bg-sidebar/95 shadow-lg backdrop-blur dark:border-border dark:bg-sidebar/90 z-50">
            {chatbots.map((bot) => (
              <button
                key={bot.name}
                onClick={() => {
                  setSelectedBot(bot.name)
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent dark:hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
              >
                {typeof bot.icon === "string" ? <span className="text-sm">{bot.icon}</span> : bot.icon}
                {bot.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <GhostIconButton label="More">
          <MoreHorizontal className="h-4 w-4" />
        </GhostIconButton>
      </div>
    </div>
  )
}
