"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete01Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { DeleteAccountDialog } from "./delete-account-dialog"

export function DeleteAccount() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = React.useState(false)

  if (!session?.user?.email) return null

  return (
    <>
      <Card className="border-border/50 overflow-hidden p-0 w-full">
        <CardHeader className="border-b bg-muted/30 py-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={Delete01Icon} className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>Manage irreversible account actions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-destructive flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                Delete This Account
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Once you delete your account, there is no going back. All your data including
                elections, organizations, and profile info will be permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        userEmail={session.user.email}
        hasOrganization={!!session.user.organizationId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
