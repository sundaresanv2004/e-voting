import { redirect } from "next/navigation"
import { getProfileDataAction } from "@/lib/actions/profile"
import { UserIcon } from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { ProfileTabs } from "./_components/profile-tabs"

export const metadata = {
  title: "Account Settings",
  description: "Manage your profile, security, and account preferences.",
}

export default async function UserSettingsPage() {
  const profile = await getProfileDataAction()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 w-full pt-16">
      <PageHeader
        title="Account Settings"
        description="Manage your profile, security, and account preferences."
        icon={UserIcon}
        innerClassName="max-w-7xl"
      />
      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
        <ProfileTabs profile={profile} />
      </div>
    </div>
  )
}
