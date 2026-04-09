"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { VoterDialog } from "./VoterDialog"

interface CreateVoterTriggerProps {
  electionId: string
  listenToParams?: boolean
}

export function CreateVoterTrigger({
  electionId,
  listenToParams = false,
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
        className="gap-2 bg-primary text-primary-foreground shadow-sm px-5"
      >
        <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" strokeWidth={2.5} />
        <span>Add New Voter</span>
      </Button>

      <VoterDialog
        electionId={electionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
