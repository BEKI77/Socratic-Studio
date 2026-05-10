import { cls } from "./utils"
import { User, Sparkles } from "lucide-react"
import type { MessageProps } from "../types/types"

export default function Message({ role, children }: MessageProps) {
  const isUser = role === "user"
  return (
    <div className={cls("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cls(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-lg",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-white dark:bg-zinc-800 text-foreground border border-border/50"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
      </div>
      
      <div
        className={cls(
          "max-w-[85%] rounded-[24px] px-5 py-3.5 text-[15px] leading-relaxed shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "glass dark:bg-zinc-900/60 text-foreground rounded-tl-none border-border/40"
        )}
      >
        {children}
      </div>
    </div>
  )
}
