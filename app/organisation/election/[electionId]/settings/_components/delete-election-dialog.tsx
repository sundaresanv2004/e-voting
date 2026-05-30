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
import { deleteElection } from "@/lib/actions/election"
import { Spinner } from "@/components/ui/spinner"

interface DeleteElectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionName: string
  electionId: string
}

export function DeleteElectionDialog({
  open,
  onOpenChange,
  electionName,
  electionId,
}: DeleteElectionDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()

    setIsPending(true)
    try {
      const res = await deleteElection(electionId)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Election deleted successfully")
      onOpenChange(false)
      // Redirect back to org elections list
      router.push("/organisation/elections")
      router.refresh()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            election <strong className="text-foreground">{electionName}</strong> and remove
            all associated data, candidates, and votes from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            variant="delete"
          >
            {isPending && <Spinner />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
