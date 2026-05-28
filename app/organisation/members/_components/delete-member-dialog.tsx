"use client"

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

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

interface DeleteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: {
    id: string
    name?: string
    email: string
    type: "member"
  } | null
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  target,
}: DeleteMemberDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!target) return

    setIsPending(true)
    try {
      // Use the Better Auth client to remove from the organization
      const res = await authClient.organization.removeMember({
        memberIdOrEmail: target.id, // Better Auth accepts member ID or email
      })

      if (res.error) {
        toast.error(res.error.message || `Failed to remove member`)
      } else {
        toast.success("Member removed successfully")
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const displayName = target?.name || target?.email || "this user"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <strong className="text-foreground">{displayName}</strong>?
            They will lose all access to this organization and its elections.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
