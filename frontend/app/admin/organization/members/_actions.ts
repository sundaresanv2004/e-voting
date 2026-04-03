"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"
import { sendOrgInvitationEmail, sendElectionAssignmentEmail } from "@/lib/mail"

export async function getMembers() {
  const session = await auth()
  const orgId = session?.user?.organizationId as string
  if (!orgId) return { members: [], orgCreatorId: undefined }

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { createdByUserId: true }
  })

  const members = await db.user.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      hasAllElectionsAccess: true,
      createdAt: true,
      updatedAt: true,
      electionAccess: {
        select: {
          electionId: true,
          createdAt: true,
          updatedAt: true,
          election: {
            select: {
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
        },
        orderBy: { createdAt: "desc" as const },
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return {
    members,
    orgCreatorId: org?.createdByUserId
  }
}

export async function searchPotentialMember(query: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) throw new Error("Unauthorized")

  if (!query || query.length < 3) {
    return { success: false, error: "Search term must be at least 3 characters" }
  }

  const users = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } }
      ]
    },
    include: {
      organization: {
        select: {
          name: true
        }
      }
    },
    take: 5
  })

  if (users.length === 0) {
    return { success: true, results: [], status: "not_found" }
  }

  const results = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    status: user.organizationId === orgId 
      ? "already_in_org" 
      : user.organizationId 
        ? "in_another_org" 
        : "available",
    currentOrgName: user.organization?.name
  }))

  return { success: true, results }
}

export async function addMemberAction(
  userId: string,
  role: UserRole,
  hasAllAccess: boolean,
  electionIds: string[]
) {
  const session = await auth()
  const adminId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, organizationId: true }
    })

    if (!user) throw new Error("User not found")
    if (user.organizationId && user.organizationId !== orgId) {
      throw new Error("User already belongs to another organization")
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    })

    await db.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: orgId,
          role,
          hasAllElectionsAccess: hasAllAccess
        }
      })

      // 2. Manage Granular Access
      if (role === UserRole.STAFF || role === UserRole.VIEWER) {
        // Clear existing access
        await tx.userElectionAccess.deleteMany({
          where: { userId }
        })

        if (!hasAllAccess && electionIds.length > 0) {
          // Add new specific access
          await tx.userElectionAccess.createMany({
            data: electionIds.map(id => ({
              userId,
              electionId: id,
              createdByUserId: adminId!,
              updatedByUserId: adminId!
            }))
          })
        }
      }
    })

    // 3. Send Notifications
    await sendOrgInvitationEmail(user.email, user.name || "User", org?.name || "Organization", role)
    
    if (!hasAllAccess && electionIds.length > 0 && (role === UserRole.STAFF || role === UserRole.VIEWER)) {
       const elections = await db.election.findMany({
         where: { id: { in: electionIds } },
         select: { id: true, name: true }
       })
       
       for (const election of elections) {
         await sendElectionAssignmentEmail(user.email, user.name || "User", org?.name || "Organization", election.name, role, election.id)
       }
    }

    revalidatePath("/admin/organization/members")
    return { success: true }
  } catch (error: any) {
    console.error("[ADD_MEMBER_ACTION]", error)
    return { success: false, error: error.message || "Failed to add member" }
  }
}

export async function removeMemberAction(userId: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId, organizationId: orgId },
        data: {
          organizationId: null,
          role: UserRole.USER,
          hasAllElectionsAccess: false
        }
      })

      await tx.userElectionAccess.deleteMany({
        where: { userId }
      })
    })

    revalidatePath("/admin/organization/members")
    return { success: true }
  } catch (error: any) {
    console.error("[REMOVE_MEMBER_ACTION]", error)
    return { success: false, error: "Failed to remove member" }
  }
}

export async function getElectionsForAssignment() {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) return []

  return await db.election.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      name: true,
      status: true
    },
    orderBy: { createdAt: "desc" }
  })
}
