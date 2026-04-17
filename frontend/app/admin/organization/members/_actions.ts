"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { sendOrgInvitationEmail, sendElectionAssignmentEmail } from "@/lib/mail"

export async function getMembers() {
  const session = await auth()
  const orgId = session?.user?.organizationId as string
  const userRole = session?.user?.role

  if (!orgId || userRole !== UserRole.ORG_ADMIN) {
    return { members: [], orgCreatorId: undefined }
  }

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
  const userRole = session?.user?.role

  if (!orgId || userRole !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  if (!query || query.length < 3) {
    return { success: false, error: "Search term must be at least 3 characters" }
  }

  const users = await db.user.findMany({
    where: {
      OR: [
        { email: { equals: query, mode: "insensitive" } },
        { email: { startsWith: query, mode: "insensitive" } },
        { name: { startsWith: query, mode: "insensitive" } }
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

          // AuditLog: Specific Election Access
          await tx.adminAuditLog.create({
            data: {
              action: "ACCESS_GRANTED",
              entityType: AuditEntityType.USER,
              entityId: userId,
              adminId: adminId!,
              organizationId: orgId!,
              status: AuditStatus.SUCCESS,
              metadata: { electionIds, reason: "Initial member add" }
            }
          })
        }
      }

      // 3. AuditLog: Member Added
      await tx.adminAuditLog.create({
        data: {
          action: "MEMBER_ADDED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId: adminId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { role, hasAllElectionsAccess: hasAllAccess }
        }
      })
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

export async function updateMemberAction(
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

  if (userId === adminId) {
    throw new Error("Self-modification of organization role is not allowed. Please have another administrator update your role.")
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId, organizationId: orgId },
      select: { name: true, email: true }
    })

    if (!user) throw new Error("Member not found in organization")

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    })

    const existingAccess = await db.userElectionAccess.findMany({
      where: { userId },
      select: { electionId: true }
    })
    const existingIds = existingAccess.map(ea => ea.electionId)
    const newlyAddedIds = electionIds.filter(id => !existingIds.includes(id))

    await db.$transaction(async (tx) => {
      const oldUser = await tx.user.findUnique({
        where: { id: userId },
        select: { role: true, hasAllElectionsAccess: true }
      })

      const oldAccess = await tx.userElectionAccess.findMany({
        where: { userId },
        select: { electionId: true }
      })
      const oldIds = oldAccess.map(a => a.electionId)

      // 1. Update User Role & Access
      await tx.user.update({
        where: { id: userId },
        data: {
          role,
          hasAllElectionsAccess: hasAllAccess
        }
      })

      // 2. Manage Granular Access
      // Always Clear existing access to start fresh for this member
      await tx.userElectionAccess.deleteMany({
        where: { userId }
      })

      if (!hasAllAccess && electionIds.length > 0 && (role === UserRole.STAFF || role === UserRole.VIEWER)) {
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

      // 3. Perform Member Update Log
      await tx.adminAuditLog.create({
        data: {
          action: "MEMBER_UPDATED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId: adminId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { 
            before: { role: oldUser?.role, hasAllAccess: oldUser?.hasAllElectionsAccess },
            after: { role, hasAllAccess }
          }
        }
      })

      // 4. Log Access Changes
      const addedIds = electionIds.filter(id => !oldIds.includes(id))
      const removedIds = oldIds.filter(id => !electionIds.includes(id))

      if (addedIds.length > 0) {
        await tx.adminAuditLog.create({
          data: {
            action: "ACCESS_GRANTED",
            entityType: AuditEntityType.USER,
            entityId: userId,
            adminId: adminId!,
            organizationId: orgId!,
            status: AuditStatus.SUCCESS,
            metadata: { electionIds: addedIds }
          }
        })
      }

      if (removedIds.length > 0) {
        await tx.adminAuditLog.create({
          data: {
            action: "ACCESS_REVOKED",
            entityType: AuditEntityType.USER,
            entityId: userId,
            adminId: adminId!,
            organizationId: orgId!,
            status: AuditStatus.SUCCESS,
            metadata: { electionIds: removedIds }
          }
        })
      }
    })

    // 3. Send Notifications for new assignments
    if (!hasAllAccess && newlyAddedIds.length > 0 && (role === UserRole.STAFF || role === UserRole.VIEWER)) {
       const elections = await db.election.findMany({
         where: { id: { in: newlyAddedIds } },
         select: { id: true, name: true }
       })
       
       for (const election of elections) {
         await sendElectionAssignmentEmail(user.email, user.name || "User", org?.name || "Organization", election.name, role, election.id)
       }
    }
    
    revalidatePath("/admin/organization/members")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_MEMBER_ACTION]", error)
    return { success: false, error: error.message || "Failed to update member permissions" }
  }
}

export async function removeMemberAction(userId: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  const currentUserId = session?.user?.id
  if (userId === currentUserId) {
    throw new Error("Self-removal from organization is not allowed. Please have another administrator remove you.")
  }

  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      })

      const access = await tx.userElectionAccess.findMany({
        where: { userId },
        select: { electionId: true }
      })
      const electionIds = access.map(a => a.electionId)

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

      // AuditLog: Removal
      await tx.adminAuditLog.create({
        data: {
          action: "MEMBER_REMOVED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId: session?.user?.id!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { name: user?.name, email: user?.email }
        }
      })

      if (electionIds.length > 0) {
        await tx.adminAuditLog.create({
          data: {
            action: "ACCESS_REVOKED",
            entityType: AuditEntityType.USER,
            entityId: userId,
            adminId: session?.user?.id!,
            organizationId: orgId!,
            status: AuditStatus.SUCCESS,
            metadata: { electionIds, reason: "Member removed from organization" }
          }
        })
      }
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
  const userRole = session?.user?.role

  if (!orgId || userRole !== UserRole.ORG_ADMIN) return []

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
