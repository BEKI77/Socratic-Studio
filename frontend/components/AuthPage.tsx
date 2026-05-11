"use client"

import React, { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { GraduationCap, BookOpen, BrainCircuit } from "lucide-react"

export default function AuthPage() {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(loginData.username, loginData.password)
      toast.success("Logged in successfully")
    } catch (error: any) {
      toast.error(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await register(registerData.username, registerData.email, registerData.password)
      toast.success("Account created successfully")
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background overflow-hidden">
      {/* Left Side: Branding & Visuals (Hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 to-indigo-950 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-white/70">
            Socratic Studio
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold leading-tight">
              Master your subjects with <span className="text-blue-400">AI-driven</span> insights.
            </h1>
            <p className="text-lg text-zinc-400">
              Personalized learning paths tailored to your unique academic journey.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Smart Tutoring</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">Resource Library</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-lg italic text-zinc-300">
              "Education is not the filling of a pail, but the lighting of a fire."
            </p>
            <footer className="text-sm text-zinc-500">— William Butler Yeats</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span>Socratic Studio</span>
        </div>

        <div className="w-full max-w-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your details to access your studio.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-100 dark:bg-blue-950/30 rounded-xl h-12">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900/50 data-[state=active]:shadow-sm transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-blue-900/50 data-[state=active]:shadow-sm transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      required
                      className="h-11 rounded-xl border-zinc-200 dark:border-blue-900/50 bg-zinc-50/50 dark:bg-blue-950/20"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" className="text-sm text-blue-600 hover:text-blue-500 font-medium dark:text-blue-400">
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      className="h-11 rounded-xl border-zinc-200 dark:border-blue-900/50 bg-zinc-50/50 dark:bg-blue-950/20"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <Button
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 mt-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0 focus-visible:outline-none">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      placeholder="johndoe"
                      required
                      className="h-11 rounded-xl border-zinc-200 dark:border-blue-900/50 bg-zinc-50/50 dark:bg-blue-950/20"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="h-11 rounded-xl border-zinc-200 dark:border-blue-900/50 bg-zinc-50/50 dark:bg-blue-950/20"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      required
                      className="h-11 rounded-xl border-zinc-200 dark:border-blue-900/50 bg-zinc-50/50 dark:bg-blue-950/20"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>
                  <Button
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 mt-2"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground px-8">
            By clicking continue, you agree to our{" "}
            <button className="underline underline-offset-4 hover:text-blue-500 transition-colors">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="underline underline-offset-4 hover:text-blue-500 transition-colors">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

