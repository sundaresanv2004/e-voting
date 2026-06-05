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

import { deleteAnonymousBallot } from "@/lib/actions/voter"
import { type AnonymousBallotRow } from "./anonymous-ballots-table"

interface DeleteAnonymousBallotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ballot: AnonymousBallotRow | null
  electionId: string
}

export function DeleteAnonymousBallotDialog({
  open,
  onOpenChange,
  ballot,
  electionId,
}: DeleteAnonymousBallotDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!ballot) return

    setIsDeleting(true)
    const res = await deleteAnonymousBallot(ballot.id, electionId)
    setIsDeleting(false)

    if (!res.success) {
      toast.error(res.error || "Failed to delete anonymous ballot")
      return
    }

    toast.success("Anonymous ballot deleted successfully")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Anonymous Ballot?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the ballot and all associated votes. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Ballot"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
