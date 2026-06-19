"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Archive01Icon,
  MapsIcon,
  ArrowRight01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { ElectionStatus } from "@prisma/client"
import { logElectionCodeAccess } from "../_actions"
import { copyToClipboard } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface ElectionCodeCardProps {
  code: string
  electionId: string
  electionName: string
  electionStatus: ElectionStatus
  totalCategories: number
}

export function ElectionCodeCard({
  code,
  electionId,
  electionName,
  electionStatus,
  totalCategories,
}: ElectionCodeCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleReveal = async () => {
    const nextVisible = !isVisible
    setIsVisible(nextVisible)

    if (nextVisible) {
      try {
        await logElectionCodeAccess(electionId, "revealed")
      } catch {
        // Audit failure shouldn't block UX
      }
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      toast.success("Election code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy code")
    }

    try {
      await logElectionCodeAccess(electionId, "copied")
    } catch {
      // Audit failure shouldn't block UX
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1">
        <div className="rounded-3xl overflow-hidden bg-background/50">
          {/* Header — election name + status badge + categories link */}
          <CardHeader className="px-4 py-3 pb-3 border-b border-border/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={MapsIcon} className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-base font-bold tracking-tight truncate"
                  title={electionName}
                >
                  {electionName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 font-black uppercase tracking-widest border-none rounded-full ${STATUS_STYLES[electionStatus]}`}
                  >
                    {electionStatus}
                  </Badge>
                  <Link
                    href={`/organisation/election/${electionId}/categories`}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors whitespace-nowrap group/cat"
                  >
                    <HugeiconsIcon icon={Tag01Icon} className="h-3 w-3" />
                    {totalCategories > 0
                      ? `${totalCategories} categor${totalCategories !== 1 ? "ies" : "y"}`
                      : "No categories"}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-2.5 w-2.5 -translate-x-1 opacity-0 transition-all group-hover/cat:translate-x-0 group-hover/cat:opacity-100"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
            {/* Code Block */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/[0.02] border shadow-sm group">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Election Code
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary"
                    onClick={handleReveal}
                    aria-label={isVisible ? "Hide election code" : "Reveal election code"}
                  >
                    <HugeiconsIcon
                      icon={isVisible ? ViewOffSlashIcon : ViewIcon}
                      className="h-3.5 w-3.5"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary"
                    onClick={handleCopy}
                    aria-label="Copy election code"
                  >
                    <HugeiconsIcon
                      icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                      className={`h-3.5 w-3.5 ${copied ? "text-emerald-500" : ""}`}
                    />
                  </Button>
                </div>
              </div>
              <div className="relative overflow-hidden h-10 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50">
                <p
                  className={`font-mono text-xl font-black tracking-[0.2em] transition-all duration-300 ${isVisible ? "opacity-100 blur-0" : "select-none opacity-30 blur-md"}`}
                >
                  {code}
                </p>
                {!isVisible && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                      Click eye to reveal
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notice */}
            <div className="space-y-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600">
                <HugeiconsIcon icon={Archive01Icon} className="h-3 w-3" />
                Important Notice
              </p>
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                Authorized personnel can use this{" "}
                <strong>Election Code</strong> to securely access the voting session on the
                Desktop Terminal App. Share only with trusted candidates or staff.
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
