"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete01Icon, Alert01Icon, Logout03Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"

export function DangerZone() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6 w-full text-left">
      {/* Leave Organization */}
      {user.organizationId && (
        <Card className="border-border/50 overflow-hidden p-0 w-full shadow-none bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/30 py-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <HugeiconsIcon icon={Logout03Icon} className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-amber-600">Leave Organization</CardTitle>
                <CardDescription className="text-xs">Revoke your access to the current organization.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-8">
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
                onClick={() => toast.info("This action is currently disabled in the desktop beta.")}
                className="rounded-xl text-amber-600 border-amber-500/30 hover:bg-amber-500/10 h-10 font-bold text-xs"
              >
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account */}
      <Card className="border-border/50 overflow-hidden p-0 w-full shadow-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30 py-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={Delete01Icon} className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-xs">Manage irreversible account actions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-destructive flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                Delete This Account
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Once you delete your account, there is no going back. All your data including
                elections and profile info will be permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              className="rounded-xl h-10 font-bold text-xs"
              onClick={() => toast.info("Account deletion is only available via support.")}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
