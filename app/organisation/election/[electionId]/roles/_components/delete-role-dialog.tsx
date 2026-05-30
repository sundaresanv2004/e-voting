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
import { deleteRole } from "@/lib/actions/role"

interface DeleteRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: { id: string; name: string } | null
  electionId: string
}

export function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  electionId,
}: DeleteRoleDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!role) return

    setIsPending(true)
    try {
      const res = await deleteRole(role.id, electionId)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Role deleted successfully")
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
          <AlertDialogTitle>Delete this role?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Deleting{" "}
            <strong className="text-foreground">{role?.name}</strong> will also remove all
            candidates registered under this role.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} variant="delete">
            {isPending && <Spinner />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
