"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout03Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { checkOrganizationOwnershipAction } from "../_actions"

export function LeaveOrganization() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isOwner, setIsOwner] = React.useState(false)

  React.useEffect(() => {
    async function checkOwnership() {
      const { isOwner: ownershipStatus } = await checkOrganizationOwnershipAction()
      setIsOwner(!!ownershipStatus)
    }
    if (session?.user?.organizationId) {
      checkOwnership()
    }
  }, [session?.user?.organizationId])

  if (!session?.user) return null

  return (
    <>
      <Card className="border-border/50 overflow-hidden p-0 w-full">
        <CardHeader className="border-b bg-muted/30 py-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <HugeiconsIcon icon={Logout03Icon} className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-amber-600">Leave Organization</CardTitle>
              <CardDescription>Revoke your access to the current organization.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                Leave Organization
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                You will immediately lose access to all elections, settings, and logs within the current organization. You will need an invite to rejoin.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsOpen(true)}
              className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
            >
              Leave Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      <LeaveOrganizationDialog
        orgName="leave organization"
        isOwner={isOwner}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
