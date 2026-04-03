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
import { removeMemberAction } from "../_actions"
import { toast } from "sonner"
import { type Member } from "./columns"
import { Spinner } from "@/components/ui/spinner"

interface DeleteMemberDialogProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange,
  onSuccess
}: DeleteMemberDialogProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async () => {
    if (!member) return
    setIsPending(true)
    try {
      const result = await removeMemberAction(member.id)
      if (result.success) {
        toast.success(`Removed ${member.name || member.email} from organization`)
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to remove member")
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
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove <strong>{member?.name || member?.email}</strong> from your organization and revoke all access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors shadow-none"
          >
            {isPending && <Spinner className="mr-2" color="currentColor" />}
            {isPending ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
