"use client"

import AIAssistantUI from "../components/AIAssistantUI"
import AuthPage from "../components/AuthPage"
import { useAuth } from "../hooks/useAuth"

export default function Page() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!token) {
    return <AuthPage />
  }

  return <AIAssistantUI />
}
