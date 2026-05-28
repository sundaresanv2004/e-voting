import { PageHeader } from "@/components/shared/page-header"
import { UserGroupIcon } from "@hugeicons/core-free-icons"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { MembersDataTable } from "./_components/members-data-table"
import { getOrganizationMembers } from "@/lib/actions/member"

export default async function MembersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Fetch members server-side
  const membersRes = await getOrganizationMembers()
  const members = membersRes.success ? membersRes.members : []
  const currentUserId = session.user.id

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Members"
        description="Manage your organization team members and their election access."
        icon={UserGroupIcon}
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <MembersDataTable 
          members={members || []} 
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
