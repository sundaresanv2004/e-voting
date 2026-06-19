"use client"

import React, { useState, useRef } from "react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { sendTestEmail } from "./actions"
import { copyToClipboard } from "@/lib/utils"

interface Template {
  id: string
  name: string
  description: string
  tag: string
  tagColor: string
  html: string
}

interface MailPreviewClientProps {
  templates: Template[]
}

export function MailPreviewClient({ templates }: MailPreviewClientProps) {
  const [activeId, setActiveId] = useState(templates[0].id)
  const [copied, setCopied] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const active = templates.find((t) => t.id === activeId)!

  const handleCopy = async () => {
    const success = await copyToClipboard(active.html)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy HTML")
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address")
      return
    }
    setIsSending(true)
    const result = await sendTestEmail(active.html, testEmail, active.name)
    setIsSending(false)
    
    if (result.success) {
      toast.success("Test email sent successfully!")
    } else {
      toast.error(result.error || "Failed to send test email")
    }
  }

  // Group templates by tag for the sidebar
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.tag]) {
      acc[template.tag] = []
    }
    acc[template.tag].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                ✉
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none mb-1">Mail Preview</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">e-voting dev tool</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-3">
            {Object.entries(groupedTemplates).map(([tag, tpls]) => (
              <div key={tag} className="mb-6">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpls[0]?.tagColor }} />
                  {tag}
                </div>
                <SidebarMenu>
                  {tpls.map((t) => (
                    <SidebarMenuItem key={t.id}>
                      <SidebarMenuButton
                        isActive={activeId === t.id}
                        onClick={() => setActiveId(t.id)}
                        className="px-3"
                      >
                        <span className="font-medium text-sm">{t.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>
        </Sidebar>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="preview" className="flex h-full flex-col">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6 bg-card">
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm"
                  style={{ backgroundColor: active.tagColor }}
                >
                  {active.tag}
                </span>
                <span className="text-sm font-semibold">{active.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <TabsList className="h-8">
                  <TabsTrigger value="preview" className="text-xs px-4">Preview</TabsTrigger>
                  <TabsTrigger value="html" className="text-xs px-4">HTML</TabsTrigger>
                </TabsList>
                
                <div className="w-px h-4 bg-border mx-1" />
                
                <div className="flex items-center gap-1.5">
                  <Input
                    type="email"
                    placeholder="Enter email to test..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="h-8 w-[200px] text-xs bg-background"
                  />
                  <Button 
                    variant="default"
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={handleSendTest}
                    disabled={isSending}
                  >
                    {isSending ? "Sending..." : "Send Test"}
                  </Button>
                </div>

                <div className="w-px h-4 bg-border mx-1" />

                <Button 
                  variant={copied ? "default" : "outline"} 
                  size="sm" 
                  className={`h-8 text-xs transition-colors ${copied ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied!" : "Copy HTML"}
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-auto bg-muted/20">
              <TabsContent value="preview" className="h-full m-0 p-6 flex justify-center">
                <div className="flex w-full max-w-[680px] flex-col">
                  <div className="mb-4 text-right">
                    <span className="text-xs font-medium text-muted-foreground">600px max-width · gmail-safe rendering</span>
                  </div>
                  
                  {/* Mock Browser Frame */}
                  <div className="rounded-t-xl border border-b-0 border-border bg-card p-3 flex items-center gap-4">
                    <div className="flex gap-1.5 ml-1">
                      <div className="h-3 w-3 rounded-full bg-red-500/90" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/90" />
                      <div className="h-3 w-3 rounded-full bg-green-500/90" />
                    </div>
                    <div className="flex-1 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground text-center line-clamp-1 border border-border/50">
                      📧 {active.name} · {process.env.NEXT_PUBLIC_CONTACT_MAIL || "no contact is given"}
                    </div>
                  </div>
                  
                  <iframe
                    ref={iframeRef}
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f8f8fc;}</style></head><body>${active.html}</body></html>`}
                    className="w-full min-h-[600px] border border-border rounded-b-xl bg-white shadow-sm"
                    title={`Preview: ${active.name}`}
                    onLoad={(e) => {
                      const iframe = e.currentTarget
                      try {
                        const doc = iframe.contentDocument || iframe.contentWindow?.document
                        if (doc) {
                          iframe.style.height = doc.documentElement.scrollHeight + "px"
                        }
                      } catch {}
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="html" className="h-full m-0 p-6 flex justify-center">
                <div className="w-full max-w-[900px] rounded-xl border border-border bg-card overflow-hidden flex flex-col h-[calc(100vh-8rem)] shadow-sm">
                  <div className="border-b border-border bg-muted/50 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Raw HTML Output
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                      {active.html.length.toLocaleString()} chars
                    </span>
                  </div>
                  <pre className="flex-1 overflow-auto p-4 text-xs text-muted-foreground whitespace-pre-wrap break-words bg-background font-mono">
                    {active.html}
                  </pre>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}
