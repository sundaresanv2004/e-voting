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
import { deleteAccountAction } from "../_actions"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface DeleteAccountDialogProps {
  userEmail: string
  hasOrganization?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({
  userEmail,
  hasOrganization,
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [confirmValue, setConfirmValue] = React.useState("")
  const router = useRouter()

  const isConfirmed = confirmValue === userEmail

  const handleDelete = async () => {
    if (!isConfirmed) return
    setIsPending(true)
    try {
      const result = await deleteAccountAction()
      if (result.success) {
        toast.success("Account deleted successfully")
        await signOut({ redirect: false })
        router.push("/auth/login")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete account")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
      onOpenChange(false)
      setConfirmValue("")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col rounded-3xl">
        <AlertDialogHeader className={`px-6 py-4 relative gap-1 ${!hasOrganization ? "border-b bg-card" : "bg-card"}`}>
          <AlertDialogTitle className="font-semibold text-xl tracking-tight text-foreground">
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-muted-foreground/80 text-left">
            {hasOrganization
              ? "This action cannot be undone. All your data will be permanently cleared."
              : "This action cannot be undone. Please confirm to proceed."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-card ${hasOrganization ? "pt-2" : ""}`}>
          {hasOrganization ? (
            <div className="space-y-4">
              <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-600 rounded-2xl border flex items-start gap-3 p-4">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="space-y-1 text-left">
                  <AlertTitle className="font-semibold text-amber-600 leading-none">Action Required</AlertTitle>
                  <AlertDescription className="text-amber-600/80 text-sm leading-tight">
                    You cannot delete your account while you belong to an organization. You must leave your organization first.
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          ) : (
            <div className="text-muted-foreground space-y-4 text-left">
              <p className="text-sm leading-relaxed">
                By deleting your account, you will lose access to all your organizations, elections, and settings.
                This action is <strong className="text-foreground">permanent</strong> and cannot be reversed.
              </p>

              <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-2xl space-y-2 text-destructive">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                  Final Warning
                </p>
                <p className="text-sm leading-tight opacity-80 text-left">
                  All your participation logs, votes, and administrative roles will be wiped from the system.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <p className="text-sm font-medium text-foreground text-left">
                  Please type your email <span className="font-bold underline decoration-destructive/30 select-all tracking-tight">{userEmail}</span> to confirm.
                </p>
                <Input
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  placeholder="Enter your email"
                  className="border-destructive/20 focus-visible:ring-destructive/30 bg-muted/30"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className={`px-6 py-4 flex flex-row items-center justify-end gap-3 ${!hasOrganization ? "border-t bg-muted/30" : "bg-card pt-0 pb-6"}`}>
          <AlertDialogCancel
            onClick={() => setConfirmValue("")}
          >
            Cancel
          </AlertDialogCancel>
          {!hasOrganization && (
            <AlertDialogAction
              disabled={!isConfirmed || isPending}
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              variant="destructive"
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Confirm Deletion"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
