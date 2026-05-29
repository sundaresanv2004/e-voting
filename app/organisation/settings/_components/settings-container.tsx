"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, Shield01Icon, Settings02Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { OrganizationType } from "@prisma/client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SettingsProfileForm } from "./settings-profile-form"
import { SettingsLimitsForm } from "./settings-limits-form"
import { TransferOwnershipDialog } from "./transfer-ownership-dialog"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"

interface SettingsContainerProps {
  organization: {
    id: string
    name: string
    type: OrganizationType
    logo?: string | null
    code: string
    ownerId?: string | null
    settings?: {
      maxElections: number
      maxMembers: number
      allowCustomBranding: boolean
    } | null
  }
  currentUserId: string
}

export function SettingsContainer({ organization, currentUserId }: SettingsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOwner = organization.ownerId === currentUserId

  const [transferOpen, setTransferOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isOwner) return "general"
    return tab
  })

  React.useEffect(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isOwner) {
      setActiveTab("general")
    } else {
      setActiveTab(tab)
    }
  }, [searchParams, isOwner])

  const handleTabChange = (value: string) => {
    if (value === "danger" && !isOwner) return
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="mb-8">
        <TabsTrigger value="general">
          <HugeiconsIcon icon={Building03Icon} className="size-4 shrink-0" />
          General
        </TabsTrigger>
        <TabsTrigger value="settings">
          <HugeiconsIcon icon={Settings02Icon} className="size-4 shrink-0" />
          Settings
        </TabsTrigger>
        {isOwner && (
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
          <SettingsProfileForm organization={organization} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-0 outline-none">
          {organization.settings ? (
            <SettingsLimitsForm settings={organization.settings} />
          ) : (
            <div className="p-4 border rounded-lg bg-muted/20 text-sm text-muted-foreground">
              No settings found. Please refresh the page.
            </div>
          )}
        </TabsContent>

        {isOwner && (
          <TabsContent value="danger" className="space-y-6 mt-0 outline-none">
            {/* Transfer Ownership Card */}
            <Card className="border-primary/20 shadow-sm gap-0 p-0 overflow-hidden">
              <CardHeader className="border-b border-primary/10 flex flex-row items-start gap-3 bg-primary/5 p-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                  <HugeiconsIcon icon={Shield01Icon} className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-primary">Transfer Ownership</CardTitle>
                  <CardDescription>
                    Transfer full control of this organization to another member. You will lose owner privileges.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex justify-end">
                <Button
                  variant="infoOutline"
                  onClick={() => setTransferOpen(true)}
                >
                  Transfer Ownership
                </Button>
              </CardContent>
            </Card>

            {/* Delete Organization Card */}
            <Card className="border-destructive/20 shadow-sm gap-0 p-0 overflow-hidden">
              <CardHeader className="border-b border-destructive/10 flex flex-row items-start gap-3 bg-destructive/5 p-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive mt-0.5">
                  <HugeiconsIcon icon={Alert01Icon} className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Delete Organization</CardTitle>
                  <CardDescription>
                    Permanently delete this organization and all its data. This action cannot be undone.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex justify-end">
                <Button
                  variant="destructiveOutline"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Organization
                </Button>
              </CardContent>
            </Card>

            <TransferOwnershipDialog
              open={transferOpen}
              onOpenChange={setTransferOpen}
            />
            <DeleteOrganizationDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              organizationName={organization.name}
              organizationId={organization.id}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}
