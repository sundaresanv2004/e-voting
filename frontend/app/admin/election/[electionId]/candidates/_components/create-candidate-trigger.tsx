"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { CandidateDialog } from "./CandidateDialog"
import type { RoleColumn } from "../../roles/_components/columns"

interface CreateCandidateTriggerProps {
  electionId: string
  availableRoles: RoleColumn[]
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
  listenToParams?: boolean
}

export function CreateCandidateTrigger({
  electionId,
  availableRoles,
  variant = "default",
  size = "default",
  className,
  showText = true,
  listenToParams = false,
}: CreateCandidateTriggerProps) {
  const [open, setOpen] = React.useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!listenToParams) return

    const isNew = searchParams.get("new") === "true"
    if (isNew) {
      setOpen(true)
      // Clear the search param to prevent reopening on navigation
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [searchParams, pathname, router, listenToParams])

  return (
    <CandidateDialog
      open={open}
      onOpenChange={setOpen}
      electionId={electionId}
      availableRoles={availableRoles}
    >
      <Button variant={variant} size={size} className={className}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="w-4 h-4" />
        {showText && "Add Candidate"}
      </Button>
    </CandidateDialog>
  )
}
