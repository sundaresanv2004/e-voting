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

import { deleteVoter } from "@/lib/actions/voter"

interface DeleteVoterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voter: { id: string; name: string } | null
  electionId: string
}

export function DeleteVoterDialog({
  open,
  onOpenChange,
  voter,
  electionId,
}: DeleteVoterDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!voter) return

    setIsPending(true)
    try {
      const res = await deleteVoter(voter.id, electionId)
      if (!res.success) {
        toast.error(res.error || "Failed to delete voter")
        return
      }
      toast.success("Voter removed successfully")
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
          <AlertDialogTitle>Remove this voter?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Removing{" "}
            <strong className="text-foreground">{voter?.name}</strong> will permanently
            delete them from this election.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} variant="delete">
            {isPending && <Spinner />}
            Remove Voter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
