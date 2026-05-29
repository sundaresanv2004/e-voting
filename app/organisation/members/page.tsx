import { PageHeader } from "@/components/shared/page-header"
import { UserGroupIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { MembersDataTable } from "./_components/members-data-table"
import { getOrganizationMembers } from "@/lib/actions/member"

export default async function MembersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Find user's organization and role
  const member = await db.member.findFirst({
    where: { userId: session.user.id },
    include: { organization: true, user: true }
  })

  if (!member) {
    redirect("/setup/organization")
  }

  // Fetch members server-side
  const membersRes = await getOrganizationMembers()
  const members = membersRes.success ? membersRes.members : []
  const currentUserId = session.user.id

  const isAdmin = member.organization.ownerId === session.user.id || member.user.role === "org_admin"

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
          ownerId={member.organization.ownerId || ""}
        />
      </div>
    </div>
  )
}
