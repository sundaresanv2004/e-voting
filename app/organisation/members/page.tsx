import { PageHeader } from "@/components/shared/page-header"
import { UserGroupIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { MembersDataTable } from "./_components/members-data-table"
import { getOrganizationMembers } from "@/lib/actions/member"
import { requireOrgAdmin } from "@/lib/auth/access"

export default async function MembersPage() {
  // Layout already enforces org_admin / admin
  const { session, member } = await requireOrgAdmin()

  const membersRes = await getOrganizationMembers()
  const members = membersRes.success ? membersRes.members : []
  const currentUserId = session.user.id

  // All users who reach this page are org admins
  const isAdmin = true
  const ownerId = member.organization.ownerId || ""

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Members"
        description="Manage your organization team members and their election access."
        icon={UserGroupIcon}
        actions={
          isAdmin && (
            <Button asChild>
              <Link href="/organisation/members?new=true" className="gap-2">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                Add Member
              </Link>
            </Button>
          )
        }
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <MembersDataTable 
          members={members || []} 
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          ownerId={ownerId}
        />
      </div>
    </div>
  )
}
