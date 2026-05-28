"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DeleteOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationName: string
  organizationId: string
}

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organizationName,
  organizationId,
}: DeleteOrganizationDialogProps) {
  const router = useRouter()
  const [confirmName, setConfirmName] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)

  // Reset input when dialog opens
  React.useEffect(() => {
    if (open) {
      setConfirmName("")
    }
  }, [open])

  const handleDelete = async () => {
    if (confirmName !== organizationName) return

    setIsPending(true)
    try {
      const res = await authClient.organization.delete({
        organizationId: organizationId
      })

      if (res.error) {
        toast.error(res.error.message || "Failed to delete organization")
        setIsPending(false)
      } else {
        toast.success("Organization deleted successfully")
        // Redirect to global home/dashboard where they might select/create a new org
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} className="size-5" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <strong className="text-foreground">{organizationName}</strong>{" "}
            organization and remove all associated data, including members,
            elections, and votes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert01Icon} className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              All organization data will be permanently wiped.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Please type <strong className="select-none">{organizationName}</strong> to confirm.
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={organizationName}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmName !== organizationName || isPending}
          >
            {isPending ? "Deleting..." : "Delete Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
