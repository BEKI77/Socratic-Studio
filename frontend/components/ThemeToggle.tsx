"use client"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle({ theme, setTheme }: { theme: string, setTheme: (t: any) => void }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])

  // Render neutral icon until mounted to avoid SSR mismatch
  if (!mounted) return (
    <button className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-accent/50">
      <Moon className="h-4 w-4" />
    </button>
  )

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-1.5 rounded-xl p-2 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}
