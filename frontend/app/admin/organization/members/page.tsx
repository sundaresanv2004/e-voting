import * as React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import MembersHero from "./_components/MembersHero"
import { AddMemberDialog } from "./_components/AddMemberDialog"
import { MembersList } from "./_components/MembersList"
import { getMembers } from "./_actions"

export default async function OrganizationMembersPage() {
  const session = await auth()
  const userRole = session?.user?.role

  if (!session || userRole !== UserRole.ORG_ADMIN) {
    redirect("/auth/login")
  }

  const { members, orgCreatorId } = await getMembers()
  const currentUserId = session?.user?.id

  return (
    <div className="flex flex-col w-full">
      <MembersHero>
        <AddMemberDialog />
      </MembersHero>

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 gap-8">
          <MembersList
            initialMembers={members as any}
            orgCreatorId={orgCreatorId}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  )
}
