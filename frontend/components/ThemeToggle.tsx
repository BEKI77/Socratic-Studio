import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:bg-background dark:hover:bg-accent"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
