"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffSlashIcon, Copy01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { logElectionCodeAccess } from "../_actions"

interface CopyRevealCodeProps {
  code: string
  electionId: string
  label?: string
}

export function CopyRevealCode({ code, electionId, label = "Terminal Access Code" }: CopyRevealCodeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)

    try {
      await logElectionCodeAccess(electionId, "copied")
    } catch {
      // The copy action should not fail just because audit logging had a transient issue.
    }
  }

  const handleReveal = async () => {
    const nextVisible = !isVisible
    setIsVisible(nextVisible)

    if (nextVisible) {
      try {
        await logElectionCodeAccess(electionId, "revealed")
      } catch {
        // Revealing remains local; the server records an audit trail when available.
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/[0.01] border shadow-sm group">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
            onClick={handleReveal}
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
  )
}
