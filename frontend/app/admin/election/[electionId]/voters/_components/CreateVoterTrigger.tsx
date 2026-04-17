"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VoterDialog } from "./VoterDialog"

interface CreateVoterTriggerProps {
  electionId: string
  listenToParams?: boolean
  className?: string
}

export function CreateVoterTrigger({
  electionId,
  listenToParams = false,
  className,
}: CreateVoterTriggerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = React.useState(false)

  // Listen for ?new=true in URL to auto-open dialog
  React.useEffect(() => {
    if (listenToParams && searchParams.get("new") === "true") {
      setIsOpen(true)
      // Clean up URL without a full navigation
      const params = new URLSearchParams(searchParams)
      params.delete("new")
      const newPath = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`
      window.history.replaceState({ path: newPath }, "", newPath)
    }
  }, [listenToParams, searchParams])

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn("gap-2 group", className)}
      >
        <div className="relative">
          <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" />
          <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="relative">Add Voter</span>
      </Button>

      <VoterDialog
        electionId={electionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
