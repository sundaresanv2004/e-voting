"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { deleteVoter } from "@/lib/actions/voter"

interface DeleteVoterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voter: { id: string; name: string } | null
  electionId: string
}

export function DeleteVoterDialog({
  open,
  onOpenChange,
  voter,
  electionId,
}: DeleteVoterDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const onDelete = async () => {
    if (!voter) return

    setIsDeleting(true)
    try {
      const res = await deleteVoter(voter.id, electionId)
      if (!res.success) {
        toast.error(res.error || "Failed to delete voter")
        return
      }

      toast.success("Voter removed successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <HugeiconsIcon icon={Alert01Icon} className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center font-heading text-xl">
            Remove Voter
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">{voter?.name}</span>?{" "}
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-2 sm:space-x-0 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting && <Spinner className="mr-2" />}
            {isDeleting ? "Removing..." : "Remove Voter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
