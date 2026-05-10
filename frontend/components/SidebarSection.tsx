import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  collapsed: boolean
  onToggle: () => void
}

export default function SidebarSection({ icon, title, children, collapsed, onToggle }: SidebarSectionProps) {
  return (
    <section className="mb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors group"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-3">
          <span className="opacity-70 group-hover:scale-110 transition-transform" aria-hidden>
            {icon}
          </span>
          {title}
        </span>
        <span className="opacity-50" aria-hidden>
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
