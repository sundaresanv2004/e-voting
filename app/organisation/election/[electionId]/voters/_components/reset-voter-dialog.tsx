"use client"

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"

import { resetVoterVote } from "@/lib/actions/voter"

interface ResetVoterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voter: { id: string; name: string } | null
  electionId: string
}

export function ResetVoterDialog({
  open,
  onOpenChange,
  voter,
  electionId,
}: ResetVoterDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!voter) return

    setIsPending(true)
    try {
      const res = await resetVoterVote(voter.id, electionId)
      if (!res.success) {
        toast.error(res.error || "Failed to reset voter's vote")
        return
      }
      toast.success("Voter's vote has been reset")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset this voter&apos;s vote?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Resetting{" "}
            <strong className="text-foreground">{voter?.name}</strong>&apos;s vote will
            remove their cast ballot and allow them to vote again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isPending} variant="warningOutline">
            {isPending && <Spinner />}
            Reset Vote
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
