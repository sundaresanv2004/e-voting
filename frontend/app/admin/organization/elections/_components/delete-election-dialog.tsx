"use client"

import * as React from "react"
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
import { deleteElection } from "../_actions"
import { toast } from "sonner"
import { type Election } from "./election-details-sheet"

interface DeleteElectionDialogProps {
  election: Election | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteElectionDialog({ 
  election, 
  open, 
  onOpenChange,
  onSuccess 
}: DeleteElectionDialogProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async () => {
    if (!election) return
    setIsPending(true)
    try {
      const result = await deleteElection(election.id)
      if (result.success) {
        toast.success("Election deleted successfully")
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to delete election")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the <strong>{election?.name}</strong> election and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? "Deleting..." : "Delete Election"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
