"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { login as apiLogin, register as apiRegister, fetchMe } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("auth_token")
      if (savedToken) {
        setToken(savedToken)
        try {
          const userData = await fetchMe(savedToken)
          setUser(userData)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          localStorage.removeItem("auth_token")
          setToken(null)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password)
    setToken(data.access_token)
    localStorage.setItem("auth_token", data.access_token)
    try {
      const userData = await fetchMe(data.access_token)
      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch user data after login:", error)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    await apiRegister(username, email, password)
    await login(username, password)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
