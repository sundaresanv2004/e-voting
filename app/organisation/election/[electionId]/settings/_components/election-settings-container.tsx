"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, Building03Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

import { ElectionGeneralForm } from "./election-general-form"
import { ElectionPreferencesForm } from "./election-preferences-form"
import { DeleteElectionDialog } from "./delete-election-dialog"

interface ElectionSettingsContainerProps {
  election: any
  role: UserRole
}

export function ElectionSettingsContainer({ election, role }: ElectionSettingsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const isViewer = role === 'viewer'
  const isStaff = role === 'staff'
  const canManage = role === 'admin' || role === 'org_admin'
  const isDangerAllowed = canManage

  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isDangerAllowed) return "general"
    if (tab === "preferences" && isStaff) return "general"
    return tab
  })

  React.useEffect(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isDangerAllowed) {
      setActiveTab("general")
    } else if (tab === "preferences" && isStaff) {
      setActiveTab("general")
    } else {
      setActiveTab(tab)
    }
  }, [searchParams, isDangerAllowed, isStaff])

  const handleTabChange = (value: string) => {
    if (value === "danger" && !isDangerAllowed) return
    if (value === "preferences" && isStaff) return
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  if (isViewer) {
    return (
      <Alert className="bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30">
        <HugeiconsIcon icon={Alert01Icon} className="size-4 !text-current" />
        <AlertTitle className="font-semibold">Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view the election settings page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="general">
          <HugeiconsIcon icon={Building03Icon} className="size-4 shrink-0" />
          General
        </TabsTrigger>
        {!isStaff && (
          <TabsTrigger value="preferences">
            <HugeiconsIcon icon={Settings02Icon} className="size-4 shrink-0" />
            Preferences
          </TabsTrigger>
        )}
        {isDangerAllowed && (
          <TabsTrigger
            value="danger"
            className="!text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 data-[state=active]:bg-destructive/10 dark:data-[state=active]:bg-destructive/20"
          >
            <HugeiconsIcon icon={Alert01Icon} className="size-4 shrink-0" />
            Danger Zone
          </TabsTrigger>
        )}
      </TabsList>

      <div className="w-full">
        <TabsContent value="general" className="space-y-6 mt-0 outline-none">
          <ElectionGeneralForm election={election} canManage={canManage} />
        </TabsContent>

        {!isStaff && (
          <TabsContent value="preferences" className="space-y-6 mt-0 outline-none">
            <ElectionPreferencesForm settings={election.settings} canManage={canManage} />
          </TabsContent>
        )}

        {isDangerAllowed && (
          <TabsContent value="danger" className="space-y-6 mt-0 outline-none">
            <Card className="border-destructive/20 shadow-sm gap-0 p-0 overflow-hidden">
              <CardHeader className="border-b border-destructive/10 flex flex-row items-start gap-3 bg-destructive/5 p-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive mt-0.5">
                  <HugeiconsIcon icon={Alert01Icon} className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Delete Election</CardTitle>
                  <CardDescription>
                    Permanently delete this election and all its data. This action cannot be undone.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex justify-end">
                <Button variant="destructiveOutline" onClick={() => setDeleteOpen(true)}>
                  Delete Election
                </Button>
              </CardContent>
            </Card>

            <DeleteElectionDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              electionName={election.name}
              electionId={election.id}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}
