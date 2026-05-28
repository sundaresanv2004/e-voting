"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, Shield01Icon } from "@hugeicons/core-free-icons"
import { OrganizationType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { SettingsProfileForm } from "./settings-profile-form"
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
  }
  currentUserId: string
}

export function SettingsContainer({ organization, currentUserId }: SettingsContainerProps) {
  const [transferOpen, setTransferOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const isOwner = organization.ownerId === currentUserId

  return (
    <div className="space-y-12">
      {/* Profile Section */}
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <HugeiconsIcon icon={Building03Icon} className="size-5 text-muted-foreground" />
            Organization Profile
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your organization's general information and branding.
          </p>
        </div>
        
        <SettingsProfileForm organization={organization} />
      </section>

      {/* Danger Zone */}
      {isOwner && (
        <section className="space-y-6 pt-8 border-t">
          <div>
            <h3 className="text-lg font-medium text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} className="size-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground">
              Critical actions that affect the entire organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 space-y-4">
              <div>
                <h4 className="font-medium text-destructive">Transfer Ownership</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Transfer full control of this organization to another member. 
                  You will lose owner privileges.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setTransferOpen(true)}
              >
                Transfer Ownership
              </Button>
            </div>

            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 space-y-4">
              <div>
                <h4 className="font-medium text-destructive">Delete Organization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete this organization and all its data. 
                  This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteOpen(true)}
              >
                Delete Organization
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Dialogs */}
      {isOwner && (
        <>
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
        </>
      )}
    </div>
  )
}
