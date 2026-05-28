import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Settings02Icon } from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/shared/page-header"
import { SettingsContainer } from "./_components/settings-container"
import { getOrganizationData } from "@/lib/actions/settings"

export default async function OrganizationSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/auth/login")
  }

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
      <div className="px-4 md:px-8 py-8 max-w-[1000px] w-full">
        <SettingsContainer 
          organization={organization} 
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
