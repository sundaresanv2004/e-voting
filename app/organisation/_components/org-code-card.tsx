"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  Copy01Icon,
  CheckmarkCircle02Icon,
  Archive01Icon,
  Building06Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { OrganizationType } from "@prisma/client"
import { copyToClipboard } from "@/lib/utils"

interface OrgCodeCardProps {
  code: string
  orgName: string
  orgType: OrganizationType
  createdAt: Date
}

const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  SCHOOL: "School",
  COLLEGE: "College",
  OTHER: "Other",
}

export function OrgCodeCard({ code, orgName, orgType, createdAt }: OrgCodeCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      toast.success("Organization code copied!")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy code")
    }
  }

  const handleReveal = () => {
    setIsVisible(!isVisible)
  }

  return (
    <Card className="border-border/50 shadow-sm py-0 gap-0 overflow-hidden">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-1">
        <div className="rounded-3xl overflow-hidden bg-background/50">
          <CardHeader className="px-4 py-3 pb-3 border-b border-border/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Building06Icon} className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{orgName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium whitespace-nowrap">
                    {ORG_TYPE_LABELS[orgType]}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    Since {format(createdAt, "MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-primary/[0.02] border shadow-sm group">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Organization Code
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                    onClick={handleReveal}
                    aria-label={isVisible ? "Hide organization code" : "Reveal organization code"}
                  >
                    <HugeiconsIcon icon={isVisible ? ViewOffSlashIcon : ViewIcon} className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                    onClick={handleCopy}
                    aria-label="Copy organization code"
                  >
                    <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} className={`h-3.5 w-3.5 ${copied ? "text-emerald-500" : ""}`} />
                  </Button>
                </div>
              </div>
              <div className="relative overflow-hidden h-10 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50">
                <p className={`font-mono text-xl font-black tracking-[0.2em] transition-all duration-300 ${isVisible ? "blur-0 opacity-100" : "blur-md opacity-30 select-none"}`}>
                  {code}
                </p>
                {!isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Click eye to reveal</span>
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
                Share this <strong>Organization Code</strong> securely with members so they can join your organization. Treat this code carefully to prevent unauthorized access.
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
