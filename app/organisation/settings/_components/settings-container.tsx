"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, Shield01Icon, Settings02Icon, Alert01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
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
import { Badge } from "@/components/ui/badge"

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
                      Irreversible organization actions. Proceed with caution.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 divide-y divide-border/50 py-0">
                {/* Transfer Ownership */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 py-5">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Transfer Ownership</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Transfer full control of this organization to another member. You will lose owner privileges.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:pt-1">
                    <Button variant="infoOutline" size="sm" onClick={() => setTransferOpen(true)}>
                      Transfer Ownership
                    </Button>
                  </div>
                </div>

                {/* Delete Organization */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 py-5">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Delete Organization</span>
                        <Badge variant="destructive" className="text-xs">Irreversible</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Permanently delete this organization and all its data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:pt-1">
                    <Button variant="destructiveOutline" size="sm" onClick={() => setDeleteOpen(true)}>
                      Delete Organization
                    </Button>
                  </div>
                </div>
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
