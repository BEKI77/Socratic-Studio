"use client"

import React from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, Bell, Zap, LogOut } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, logout } = useAuth()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="max-w-2xl p-0 overflow-hidden glass rounded-3xl border-border/40">
        <div className="flex h-125">
          {/* Sidebar */}
          <div className="w-48 border-r border-border/40 bg-accent/20 p-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Settings</h2>
            <Tabs defaultValue="profile" orientation="vertical" className="w-full">
              <TabsList className="flex flex-col h-auto bg-transparent gap-1">
                <TabsTrigger
                  value="profile"
                  className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="workspace"
                  className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Zap className="h-4 w-4" />
                  Workspace
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="w-full justify-start gap-2 px-3 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-auto pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                onClick={() => {
                  logout()
                  onClose()
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage your personal information and how others see you.</p>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                    <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="rounded-xl">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" defaultValue={user?.email} disabled className="rounded-xl bg-accent/50" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button className="rounded-xl">Save Changes</Button>
                </div>
              </TabsContent>

              <TabsContent value="workspace" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Workspace Preferences</h3>
                  <p className="text-sm text-muted-foreground">Customize your tutor experience and learning style.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-accent/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">Socratic Depth</Label>
                      <p className="text-sm text-muted-foreground">Ask more challenging follow-up questions.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-accent/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Summary</Label>
                      <p className="text-sm text-muted-foreground">Generate summaries after every study block.</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-accent/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">Markdown Rendering</Label>
                      <p className="text-sm text-muted-foreground">Render math and code with rich formatting.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Security</h3>
                  <p className="text-sm text-muted-foreground">Keep your account secure and manage access.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-pass">Current Password</Label>
                    <Input id="current-pass" type="password" placeholder="••••••••" className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input id="new-pass" type="password" placeholder="••••••••" className="rounded-xl" />
                  </div>
                  <Button className="rounded-xl">Update Password</Button>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Stay updated on your learning progress.</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Email session summaries</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Weekly learning insights</Label>
                  <Switch defaultChecked />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
