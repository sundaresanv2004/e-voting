"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon, Copy01Icon, Tick01Icon, EyeIcon, Alert01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { logOrgCodeCopied, logOrgCodeRevealed } from "@/lib/actions/settings"

interface CodeSectionProps {
  code: string
}

export function OrganizationCodeSection({ code }: CodeSectionProps) {
  const [copied, setCopied] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Organization code copied to clipboard")
    logOrgCodeCopied().catch(() => { })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReveal = () => {
    setRevealed(true)
    logOrgCodeRevealed().catch(() => { })
    // Hide it again after 10 seconds for security
    setTimeout(() => setRevealed(false), 10000)
  }

  return (
    <Card className="pb-0">
      <CardHeader className="border-b flex flex-row items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mt-0.5">
          <HugeiconsIcon icon={ShieldKeyIcon} className="size-4" />
        </div>
        <div className="space-y-1">
          <CardTitle>Organization Access Code</CardTitle>
          <CardDescription>
            Used to authenticate and identify your organization. Keep it confidential.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <code className="px-4 py-2 rounded-full bg-muted font-mono text-sm tracking-widest border">
              {revealed ? code : "••••••••••••••••"}
            </code>
          </div>
          <div className="flex flex-row gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} className={cn("size-4", copied && "text-green-500")} />
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={revealed ? () => setRevealed(false) : handleReveal}
              variant="outline"
              size="sm"
            >
              <HugeiconsIcon icon={EyeIcon} className="size-4" />
              {revealed ? "Hide" : "Reveal"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2 border-t px-6 !py-4 bg-amber-50/50 dark:bg-amber-950/20 text-sm text-amber-800 dark:text-amber-300">
        <HugeiconsIcon icon={Alert01Icon} className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        Keep this code confidential. Do not share it publicly.
      </CardFooter>
    </Card>
  )
}
