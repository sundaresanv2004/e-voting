"use client"

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { removeMemberAction } from "@/lib/actions/member"

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

interface DeleteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: {
    id: string
    userId?: string
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
      // Use userId if available, fallback to id for backwards compatibility if needed
      // (Though in our table, we pass the full member row which has userId)
      const res = await removeMemberAction(target.userId || target.id)

      if (!res.success) {
        toast.error(res.error || "Failed to remove member")
        return
      }

      toast.success("Member removed successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const displayName = target?.name || target?.email || "this user"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove{" "}
            <strong className="text-foreground">{displayName}</strong> from your
            organization and revoke all their election access.
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
            Remove Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
