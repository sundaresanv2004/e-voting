"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffSlashIcon, Copy01Icon, CheckmarkCircle02Icon, Archive01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface OrgCodeCardProps {
  code: string
}

export function OrgCodeCard({ code }: OrgCodeCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Organization code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-border/50 shadow-sm py-2 gap-0">
      <CardHeader className="px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight">Access Control</CardTitle>
          <CardDescription className="text-[11px] font-bold">
            Organization authorization
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/[0.01] border shadow-sm group">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Organization Code
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsVisible(!isVisible)}
              >
                <HugeiconsIcon icon={isVisible ? ViewOffSlashIcon : ViewIcon} className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleCopy}
              >
                <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} className={`h-3.5 w-3.5 ${copied ? "text-emerald-500" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden h-8 flex items-center">
            <p className={`font-mono text-xl font-black tracking-[0.2em] transition-all duration-300 ${isVisible ? "blur-0 opacity-100" : "blur-md opacity-30 select-none"}`}>
              {code}
            </p>
            {!isVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Click to reveal</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
          <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
            <HugeiconsIcon icon={Archive01Icon} className="h-3 w-3" />
            Important Notice
          </p>
          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
            You can use this <strong>Organization Code</strong> to securely register local hardware systems or terminals into your organization's fleet. Treat this code securely and only share it with authorized personnel during device setup.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
