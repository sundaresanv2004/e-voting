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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { leaveOrganizationAction } from "../_actions"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface LeaveOrganizationDialogProps {
  orgName: string
  isOwner?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveOrganizationDialog({
  orgName,
  isOwner,
  open,
  onOpenChange,
}: LeaveOrganizationDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [confirmValue, setConfirmValue] = React.useState("")
  const router = useRouter()
  const { update } = useSession()

  const isConfirmed = confirmValue === orgName

  const handleLeave = async () => {
    if (!isConfirmed) return
    setIsPending(true)
    try {
      const result = await leaveOrganizationAction()
      if (result.success) {
        await update()
        router.push("/admin/organization?left_org=true")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to leave organization")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col">
        <AlertDialogHeader className="px-6 py-4 border-b bg-card relative gap-1">
          <AlertDialogTitle>
            Leave Organization
          </AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to organization settings and elections.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-card">
          <div className="text-muted-foreground space-y-4">
            <p className="text-sm leading-relaxed">
              If you leave this organization, you will immediately lose your current roles and permissions within it.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2 text-amber-600">
              <p className="text-sm font-semibold flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                Warning
              </p>
              <p className="text-sm leading-tight opacity-80">
                You will need to be re-invited by an administrator to join again.
              </p>
            </div>

            {isOwner && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl p-4">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 mt-1" />
                <div className="space-y-1">
                  <AlertTitle className="font-semibold">Critical Warning</AlertTitle>
                  <AlertDescription className="text-sm leading-tight opacity-90 text-description">
                    You are the <strong className="font-bold">Organization Owner</strong>. Leaving this organization without a successor can lead to permanent loss of administrative access for everyone.
                  </AlertDescription>
                  <div className="pt-2">
                    <Link
                      href="/admin/organization/settings?tab=danger"
                      className="text-xs font-bold underline hover:opacity-80 flex items-center gap-1"
                    >
                      Transfer Ownership First
                    </Link>
                  </div>
                </div>
              </Alert>
            )}

            <div className="pt-2 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Please type <span className="font-bold underline decoration-amber-500/30 select-all">{orgName}</span> to confirm.
              </p>
              <Input
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder="Enter organization name"
                className="border-border focus-visible:ring-amber-500/30 bg-muted/30"
                autoFocus
              />
            </div>
          </div>
        </div>

        <AlertDialogFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-3 bg-muted/30">
          <AlertDialogCancel
            onClick={() => setConfirmValue("")}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed || isPending}
            className="gap-2"
            onClick={(e) => {
              e.preventDefault()
              handleLeave()
            }}
          >
            {isPending ? (
              <>
                <Spinner />
                Leaving...
              </>
            ) : "Leave"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
