"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { sendOrgInvitationEmail, sendElectionAssignmentEmail } from "@/lib/mail"
import { requireOrgAdmin, validateOrganizationElectionIds } from "@/lib/authz"

export async function getMembers() {
  const session = await auth()

  let access
  try {
    access = await requireOrgAdmin(session?.user)
  } catch {
    return { members: [], orgCreatorId: undefined }
  }

  const orgId = access.organizationId

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { ownerId: true, createdByUserId: true }
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
      isActive: true,
      lastLoginAt: true,
      lockedUntil: true,
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
    ownerId: org?.ownerId ?? org?.createdByUserId
  }
}

export async function searchPotentialMember(query: string) {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const orgId = access.organizationId

  const normalizedQuery = query.trim()

  if (!normalizedQuery || normalizedQuery.length < 3) {
    return { success: false, error: "Search term must be at least 3 characters" }
  }

  const isEmailSearch = normalizedQuery.includes("@")

  if (isEmailSearch && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedQuery)) {
    return { success: false, error: "Enter the full email address to search" }
  }

  const users = await db.user.findMany({
    where: {
      ...(isEmailSearch
        ? { email: { equals: normalizedQuery, mode: "insensitive" } }
        : { name: { equals: normalizedQuery, mode: "insensitive" } })
    },
    include: {
      organization: {
        select: {
          id: true
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
        : "available"
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
  const access = await requireOrgAdmin(session?.user)
  const adminId = access.userId
  const orgId = access.organizationId

  try {
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: { ownerId: true },
    })

    if (organization?.ownerId === userId && access.userId !== organization.ownerId) {
      throw new Error("Only the organization owner can modify owner permissions.")
    }

    const shouldUseGranularAccess = !hasAllAccess && (role === UserRole.STAFF || role === UserRole.VIEWER)
    const validElections = shouldUseGranularAccess
      ? await validateOrganizationElectionIds(orgId, electionIds)
      : []
    const validElectionIds = validElections.map((election) => election.id)

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
          hasAllElectionsAccess: hasAllAccess,
          authVersion: { increment: 1 },
        }
      })

      // 2. Manage Granular Access
      if (role === UserRole.STAFF || role === UserRole.VIEWER) {
        // Clear existing access
        await tx.userElectionAccess.deleteMany({
          where: { userId }
        })

        if (!hasAllAccess && validElectionIds.length > 0) {
          // Add new specific access
          await tx.userElectionAccess.createMany({
            data: validElectionIds.map(id => ({
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
              metadata: { electionIds: validElectionIds, reason: "Initial member add" }
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
    
    if (!hasAllAccess && validElections.length > 0 && (role === UserRole.STAFF || role === UserRole.VIEWER)) {
       for (const election of validElections) {
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
  const access = await requireOrgAdmin(session?.user)
  const adminId = access.userId
  const orgId = access.organizationId

  if (userId === adminId) {
    throw new Error("Self-modification of organization role is not allowed. Please have another administrator update your role.")
  }

  try {
    const shouldUseGranularAccess = !hasAllAccess && (role === UserRole.STAFF || role === UserRole.VIEWER)
    const validElections = shouldUseGranularAccess
      ? await validateOrganizationElectionIds(orgId, electionIds)
      : []
    const validElectionIds = validElections.map((election) => election.id)

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
    const newlyAddedIds = validElectionIds.filter(id => !existingIds.includes(id))

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
          hasAllElectionsAccess: hasAllAccess,
          authVersion: { increment: 1 },
        }
      })

      // 2. Manage Granular Access
      // Always Clear existing access to start fresh for this member
      await tx.userElectionAccess.deleteMany({
        where: { userId }
      })

      if (!hasAllAccess && validElectionIds.length > 0 && (role === UserRole.STAFF || role === UserRole.VIEWER)) {
        // Add new specific access
        await tx.userElectionAccess.createMany({
          data: validElectionIds.map(id => ({
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
      const addedIds = validElectionIds.filter(id => !oldIds.includes(id))
      const removedIds = oldIds.filter(id => !validElectionIds.includes(id))

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
       for (const election of validElections.filter((item) => newlyAddedIds.includes(item.id))) {
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
  const access = await requireOrgAdmin(session?.user)
  const orgId = access.organizationId
  const currentUserId = access.userId

  if (userId === currentUserId) {
    throw new Error("Self-removal from organization is not allowed. Please have another administrator remove you.")
  }

  try {
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: { ownerId: true },
    })

    if (organization?.ownerId === userId) {
      throw new Error("The organization owner cannot be removed. Transfer ownership first.")
    }

    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      })

      const revokedAccess = await tx.userElectionAccess.findMany({
        where: { userId },
        select: { electionId: true }
      })
      const electionIds = revokedAccess.map(a => a.electionId)

      await tx.user.update({
        where: { id: userId, organizationId: orgId },
        data: {
          organizationId: null,
          role: UserRole.USER,
          hasAllElectionsAccess: false,
          authVersion: { increment: 1 },
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
          adminId: access.userId,
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
            adminId: access.userId,
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
  let access
  try {
    access = await requireOrgAdmin(session?.user)
  } catch {
    return []
  }

  const orgId = access.organizationId

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

export async function logMemberEmailCopy(targetUserId: string, memberEmail: string) {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)

  try {
    await db.adminAuditLog.create({
      data: {
        action: "MEMBER_EMAIL_COPIED",
        entityType: AuditEntityType.MEMBER,
        entityId: targetUserId,
        adminId: access.userId,
        organizationId: access.organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { email: memberEmail, source: "member_details_sheet" },
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_MEMBER_EMAIL_COPY]", error)
    return { success: false }
  }
}
