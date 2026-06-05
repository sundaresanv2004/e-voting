import { redirect } from "next/navigation"
import { Settings02Icon } from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/shared/page-header"
import { SettingsContainer } from "./_components/settings-container"
import { requireOrgAdmin } from "@/lib/auth/access"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export default async function OrganizationSettingsPage() {
  const { session, member, freshUser } = await requireOrgAdmin()

  const organization = await db.organization.findUnique({
    where: { id: member.organizationId },
    include: {
      settings: true,
    },
  })

  if (!organization) {
    redirect("/setup/organization")
  }

  // Ensure settings exist
  if (!organization.settings) {
    const newSettings = await db.organizationSettings.create({
      data: {
        organizationId: organization.id,
        createdByUserId: freshUser.id,
        updatedByUserId: freshUser.id,
      },
    })
    organization.settings = newSettings
  }

  const currentUserId = session.user.id

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Settings"
        description="Manage your organization's general information and critical settings."
        icon={Settings02Icon}
      />
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <SettingsContainer 
          organization={organization} 
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
