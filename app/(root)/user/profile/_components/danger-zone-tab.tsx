"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  LogoutSquare01Icon,
  UserRemove01Icon,
  Building02Icon,
  InformationCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { leaveOrganizationAction, deleteAccountAction } from "@/lib/actions/profile"
import { signOut } from "@/lib/auth-client"

interface DangerZoneTabProps {
  userEmail: string
  organization: { id: string; name: string; ownerId: string | null } | null
  isOrgOwner: boolean
}

function DangerCard({
  icon,
  iconColor,
  title,
  description,
  badge,
  action,
}: {
  icon: any
  iconColor: string
  title: string
  description: React.ReactNode
  badge?: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 py-5">
      <div className="flex gap-4 items-start flex-1">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {badge && <Badge variant="destructive" className="text-xs">{badge}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:pt-1">{action}</div>
    </div>
  )
}

export function DangerZoneTab({ userEmail, organization, isOrgOwner }: DangerZoneTabProps) {
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isLeavingOrg, setIsLeavingOrg] = React.useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false)

  // Delete confirm typed email
  const [confirmEmail, setConfirmEmail] = React.useState("")
  const deleteEnabled = confirmEmail === userEmail

  const handleLeaveOrg = async () => {
    setIsLeavingOrg(true)
    try {
      const result = await leaveOrganizationAction()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(result?.success || "Left organization successfully.")
        setLeaveDialogOpen(false)
        window.location.reload()
      }
    } finally {
      setIsLeavingOrg(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteEnabled || organization) return
    setIsDeletingAccount(true)
    try {
      const result = await deleteAccountAction()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Account deleted. Goodbye!")
        setDeleteDialogOpen(false)
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/auth/login"
            },
          },
        })
      }
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Danger Actions Card */}
      <Card className="overflow-hidden border-destructive/30 p-0 gap-0">
        <CardHeader className="border-b bg-destructive/5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible account actions. Proceed with caution.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 divide-y divide-border/50 py-0">
          {/* Leave Organization */}
          <div className="flex flex-col gap-3">
            <DangerCard
              icon={Building02Icon}
              iconColor="bg-amber-500/10 text-amber-500"
              title="Leave Organization"
              description={
                organization
                  ? `Leave "${organization.name}". You'll lose access to all its elections and data.`
                  : "You are not currently a member of any organization."
              }
              badge={isOrgOwner ? "Owner" : undefined}
              action={
                <Button
                  variant="warningOutline"
                  size="sm"
                  disabled={!organization || isLeavingOrg}
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  <HugeiconsIcon icon={LogoutSquare01Icon} data-icon="inline-start" strokeWidth={2} />
                  Leave
                </Button>
              }
            />

            {/* Owner warning — shown below the row, above the separator */}
            {isOrgOwner && organization && (
              <Alert variant="warning" className="mb-4">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 text-amber-500" />
                <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                  You are the <strong>owner</strong> of <strong>{organization.name}</strong>. If
                  you leave, all organization data may be lost. Consider{" "}
                  <Link
                    href="/organisation/settings?tab=danger"
                    className="underline underline-offset-2 font-semibold hover:text-amber-600 transition-colors"
                  >
                    transferring ownership
                  </Link>{" "}
                  before leaving.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Delete Account */}
          <DangerCard
            icon={UserRemove01Icon}
            iconColor="bg-destructive/10 text-destructive"
            title="Delete Account"
            description={
              organization
                ? `You must leave "${organization.name}" before you can delete your account.`
                : "Permanently delete your account and all associated data. This cannot be undone."
            }
            badge="Irreversible"
            action={
              <Button
                variant="destructiveOutline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeletingAccount}
              >
                <HugeiconsIcon icon={UserRemove01Icon} data-icon="inline-start" strokeWidth={2} />
                Delete Account
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Leave Org Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Organization?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                <p>
                  You will lose all access to{" "}
                  <strong>{organization?.name}</strong> and its elections. An admin would need to
                  re-invite you.
                </p>
                {isOrgOwner && (
                  <Alert variant="warning">
                    <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />
                    <AlertDescription className="text-xs">
                      <strong>You are the owner.</strong> Leaving without transferring ownership
                      may result in permanent data loss for your organization.{" "}
                      <Link
                        href="/organisation/settings?tab=danger"
                        className="underline underline-offset-2 font-semibold inline-flex items-center gap-0.5"
                        onClick={() => setLeaveDialogOpen(false)}
                      >
                        Transfer ownership
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3" />
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeavingOrg}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="warningOutline"
              onClick={handleLeaveOrg}
              disabled={isLeavingOrg}
            >
              {isLeavingOrg ? (
                <>
                  <Spinner />
                  Leaving…
                </>
              ) : (
                "Yes, Leave Organization"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                {organization ? (
                  <Alert variant="warning">
                    <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 text-amber-500 shrink-0" />
                    <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                      You are a member of <strong>{organization.name}</strong>. You must{" "}
                      <button
                        className="underline underline-offset-2 font-semibold hover:text-amber-600 transition-colors cursor-pointer"
                        onClick={() => {
                          setDeleteDialogOpen(false)
                          setLeaveDialogOpen(true)
                        }}
                      >
                        leave the organization
                      </button>{" "}
                      before you can delete your account.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This action is <strong>permanent</strong>. All your data will be deleted and
                    cannot be recovered. You will be signed out immediately.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!organization && (
            <div className="flex flex-col gap-2 px-0 py-2">
              <Label htmlFor="confirm-email" className="text-sm font-medium">
                Type <span className="font-bold text-foreground">{userEmail}</span> to confirm
              </Label>
              <Input
                id="confirm-email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={userEmail}
                disabled={isDeletingAccount}
                autoComplete="off"
                className="font-mono text-sm"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeletingAccount}
              onClick={() => setConfirmEmail("")}
            >
              Cancel
            </AlertDialogCancel>
            {!organization && (
              <AlertDialogAction
                variant="dangerOutline"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || !deleteEnabled}
              >
                {isDeletingAccount ? (
                  <>
                    <Spinner />
                    Deleting…
                  </>
                ) : (
                  "Delete My Account"
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
