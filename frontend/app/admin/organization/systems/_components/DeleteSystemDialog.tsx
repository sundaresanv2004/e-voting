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
import { deleteSystemAction } from "../_actions"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { type System } from "./columns"

interface DeleteSystemDialogProps {
  system: System | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteSystemDialog({
  system,
  open,
  onOpenChange,
  onSuccess,
}: DeleteSystemDialogProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async () => {
    if (!system) return
    setIsPending(true)
    try {
      const result = await deleteSystemAction(system.id)
      if (result.success) {
        toast.success(
          `"${system.name || system.hostName || "Unnamed Device"}" has been removed from your organization`
        )
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to delete system")
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
          <AlertDialogTitle>Delete this system?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <strong>{system?.name || system?.hostName || "this device"}</strong>{" "}
            from your organization, including all its logs and ballot records. This action{" "}
            <strong>cannot be undone</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors shadow-none gap-2"
          >
            {isPending && <Spinner color="currentColor" />}
            {isPending ? "Deleting..." : "Delete System"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
