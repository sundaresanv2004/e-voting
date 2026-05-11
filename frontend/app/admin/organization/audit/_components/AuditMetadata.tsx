"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick01Icon, ArrowDown01Icon, CodeIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AuditMetadataProps {
  metadata: any
}

export function AuditMetadata({ metadata }: AuditMetadataProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))
    setCopied(true)
    toast.success("Metadata copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (!metadata) return null

  return (
    <div className={cn(
      "max-w-3xl rounded-3xl border transition-all duration-300",
      isOpen
        ? "border-border bg-muted/30 shadow-sm"
        : "border-border/40 bg-muted/20 hover:border-border/60"
    )}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground group cursor-pointer outline-none"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-1 rounded-lg transition-colors",
            isOpen ? "bg-muted-foreground/10 text-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
          )}>
            <HugeiconsIcon
              icon={CodeIcon}
              className="w-3 h-3"
            />
          </div>
          <span className={cn("transition-colors", isOpen && "text-foreground/80")}>Full Metadata</span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-all active:scale-90"
              onClick={(e) => {
                e.stopPropagation()
                handleCopy()
              }}
            >
              <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} className="h-3.5 w-3.5" />
            </Button>
          )}
          <div className={cn(
            "p-1 rounded-full transition-all duration-300",
            isOpen ? "bg-muted-foreground/10 text-foreground rotate-180" : "text-muted-foreground"
          )}>
            <HugeiconsIcon icon={ArrowDown01Icon} className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="relative rounded-xl border border-border/50 bg-black/20 p-4 overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
              <HugeiconsIcon icon={CodeIcon} className="w-20 h-20 text-foreground" />
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed text-muted-foreground/90 scrollbar-thin scrollbar-thumb-border selection:bg-primary/10">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
