import { redirect } from "next/navigation"
import { Settings02Icon } from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/shared/page-header"
import { SettingsContainer } from "./_components/settings-container"
import { getOrganizationData } from "@/lib/actions/settings"
import { requireOrgAdmin } from "@/lib/auth/access"

export default async function OrganizationSettingsPage() {
  // Layout already enforces org_admin / admin
  const { session } = await requireOrgAdmin()

  const organization = await getOrganizationData()

  if (!organization) {
    redirect("/organisation")
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
