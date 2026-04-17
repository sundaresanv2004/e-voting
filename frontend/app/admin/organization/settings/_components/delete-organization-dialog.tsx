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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { deleteOrganizationAction } from "../_actions"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface DeleteOrganizationDialogProps {
  orgName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteOrganizationDialog({
  orgName,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [confirmName, setConfirmName] = React.useState("")
  const router = useRouter()
  const { update } = useSession()

  const isConfirmed = confirmName === orgName

  const handleDelete = async () => {
    if (!isConfirmed) return
    setIsPending(true)
    try {
      const result = await deleteOrganizationAction()
      if (result.success) {
        toast.success("Organization deleted successfully")
        window.location.href = "/"
      } else {
        toast.error(result.error || "Failed to delete organization")
        setIsPending(false)
        onOpenChange(false)
      }
    } catch {
      toast.error("An unexpected error occurred")
      setIsPending(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col">
        <AlertDialogHeader className="px-6 py-4 border-b bg-card relative gap-1">
          <AlertDialogTitle>
            Delete Organization
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Please confirm to proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-card">
          <div className="text-muted-foreground space-y-4">
            <p className="text-sm leading-relaxed">
              This action <strong className="text-foreground">cannot</strong> be undone. All data including elections,
              ballots, systems, and membership logs will be wiped permanently.
            </p>

            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-2xl space-y-2">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                Final Warning
              </p>
              <p className="text-sm leading-tight opacity-80">
                All systems will be disconnected and members will lose access to the administration portal immediately.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Type <span className="font-bold underline decoration-destructive/30 select-all">{orgName}</span> to confirm.
              </p>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Enter organization name"
                className="border-destructive/20 focus-visible:ring-destructive/30 bg-muted/30"
                autoFocus
              />
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-end gap-3 bg-card">
          <AlertDialogCancel
            onClick={() => setConfirmName("")}
            variant="outline"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed || isPending}
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            variant="destructive"
            className="gap-2"
          >
            {isPending ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
