"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ElectionDialog } from "./election-dialog"

interface CreateElectionTriggerProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function CreateElectionTrigger({
  variant = "default",
  size = "default",
  className,
  showText = true
}: CreateElectionTriggerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <ElectionDialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} size={size} className={className}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="w-4 h-4" />
        {showText && "Create Election"}
      </Button>
    </ElectionDialog>
  )
}
