"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import {
  AddMemberSearchSchema,
  MemberMutationSchema,
  RemoveMemberSchema,
} from "@/lib/schemas/member"

/**
 * Gets all members for the active organization, including their custom user fields
 * like electionAccess and hasAllElectionsAccess.
 */
export async function getOrganizationMembers() {
  try {
    const { organizationId: orgId } = await requireOrgActionContext({
      action: "MEMBERS_LISTED",
      entityType: AuditEntityType.MEMBER,
    })

    const members = await db.member.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            hasAllElectionsAccess: true,
            electionAccess: {
              include: {
                election: {
                  select: { id: true, name: true, status: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, members }
  } catch (error: any) {
    console.error("[GET_ORG_MEMBERS]", error)
    return { success: false, error: "Failed to fetch members" }
  }
}

/**
 * Searches for potential members in the global User pool.
 * Identifies if they are available, already in this org, or in another org.
 */
export async function searchPotentialMember(query: string) {
  const access = await requireOrgActionContext({
    action: "MEMBER_SEARCHED",
    entityType: AuditEntityType.MEMBER,
  })

  const parsed = AddMemberSearchSchema.safeParse({ query })
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.query?.[0] || "Invalid search term" }
  }

  const normalizedQuery = parsed.data.query.trim()

  if (!normalizedQuery || normalizedQuery.length < 3) {
    return { success: false, error: "Search term must be at least 3 characters" }
  }

  const isEmailSearch = normalizedQuery.includes("@")

  if (isEmailSearch && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedQuery)) {
    return { success: false, error: "Enter the full email address to search" }
  }

  try {
    const users = await db.user.findMany({
      where: {
        ...(isEmailSearch
          ? { email: { equals: normalizedQuery, mode: "insensitive" } }
          : { name: { contains: normalizedQuery, mode: "insensitive" } })
      },
      include: {
        members: {
          select: { organizationId: true }
        }
      },
      take: 5
    })

    if (users.length === 0) {
      return { success: true, results: [], status: "not_found" }
    }

    const results = users.map(user => {
      // Check member records
      const isAlreadyInThisOrg = user.members.some(m => m.organizationId === access.organizationId)
      const isAlreadyInAnotherOrg = user.members.length > 0 && !isAlreadyInThisOrg
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        status: isAlreadyInThisOrg 
          ? "already_in_org" 
          : isAlreadyInAnotherOrg 
            ? "in_another_org" 
            : "available"
      }
    })

    return { success: true, results }
  } catch (error) {
    console.error("[SEARCH_MEMBER]", error)
    return { success: false, error: "Failed to search for members" }
  }
}

/**
 * Adds a user directly to the organization and assigns them roles and election access.
 */
export async function addMemberAction(
  userId: string,
  role: "org_admin" | "staff" | "viewer",
  hasAllAccess: boolean,
  electionIds: string[]
) {
  let adminId: string | null = null
  let orgId: string | null = null
  try {
    const parsed = MemberMutationSchema.safeParse({ userId, role, hasAllAccess, electionIds })
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.electionIds?.[0] || "Invalid member access details" }
    }

    const access = await requireOrgActionContext({
      action: "MEMBER_ADDED",
      entityType: AuditEntityType.MEMBER,
      entityId: userId,
    })
    adminId = access.userId
    orgId = access.organizationId

    const values = parsed.data
    // 1. Verify target user
    const user = await db.user.findUnique({
      where: { id: values.userId },
      include: { members: true }
    })
    
    if (!user) return { success: false, error: "User not found" }
    
    // Check if they are in another organization
    const isAlreadyInThisOrg = user.members.some(m => m.organizationId === orgId)
    const isAlreadyInAnotherOrg = user.members.length > 0 && !isAlreadyInThisOrg
    
    if (isAlreadyInThisOrg) return { success: false, error: "User is already in this organization" }
    if (isAlreadyInAnotherOrg) return { success: false, error: "This user belongs to a different org. They need to leave it to join yours." }

    // Add to Better Auth Member table natively
    await auth.api.addMember({
      headers: await headers(), // Ensure we use auth headers
      body: {
        userId: values.userId,
        organizationId: orgId,
        role: values.role as any,
      }
    })

    // Prepare valid election IDs
    let validElectionIds: string[] = []
    if (!values.hasAllAccess && values.electionIds.length > 0) {
      const validElections = await db.election.findMany({
        where: { id: { in: values.electionIds }, organizationId: orgId, deletedAt: null },
        select: { id: true }
      })
      validElectionIds = validElections.map(e => e.id)
    }

    // 2. Perform custom updates in a transaction
    await db.$transaction(async (tx) => {
      // Update User table with custom role
      await tx.user.update({
        where: { id: values.userId },
        data: {
          role: values.role,
          hasAllElectionsAccess: values.hasAllAccess
        }
      })

      // Add granular election access if not full access
      if (!values.hasAllAccess && validElectionIds.length > 0) {
        await tx.userElectionAccess.createMany({
          data: validElectionIds.map(id => ({
            userId: values.userId,
            electionId: id,
            createdByUserId: adminId,
            updatedByUserId: adminId
          }))
        })
      }

      // Log the addition
      await logAdminAction({
        action: "MEMBER_ADDED",
        entityType: AuditEntityType.USER,
        entityId: values.userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { role: values.role, hasAllAccess: values.hasAllAccess, electionIds: validElectionIds }
      })
    })

    revalidatePath("/organisation/members")
    return { success: true }
  } catch (error: any) {
    console.error("[ADD_MEMBER]", error)
    try {
      await logAdminAction({
        action: "MEMBER_ADDED",
        entityType: AuditEntityType.USER,
        entityId: userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { role, hasAllAccess, error: error?.message || "Unknown error" }
      })
    } catch(e) {}
    return { success: false, error: error.message || "Failed to add member" }
  }
}

/**
 * Updates a member's custom role and granular election access.
 */
export async function updateMemberAccess(
  userId: string,
  role: "org_admin" | "staff" | "viewer",
  hasAllAccess: boolean,
  electionIds: string[]
) {
  let adminId: string | null = null
  let orgId: string | null = null
  try {
    const parsed = MemberMutationSchema.safeParse({ userId, role, hasAllAccess, electionIds })
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.electionIds?.[0] || "Invalid member access details" }
    }

    const access = await requireOrgActionContext({
      action: "MEMBER_ACCESS_UPDATED",
      entityType: AuditEntityType.MEMBER,
      entityId: userId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const values = parsed.data

    const targetMember = await db.member.findFirst({
      where: { userId: values.userId, organizationId: orgId }
    })

    if (!targetMember) return { success: false, error: "Member not found in organization" }

    if (targetMember.role !== values.role) {
      await auth.api.updateMemberRole({
        headers: await headers(),
        body: {
          memberId: targetMember.id,
          organizationId: orgId,
          role: values.role as any
        }
      })
    }

    // Verify electionIds belong to this org
    let validElectionIds: string[] = []
    if (!values.hasAllAccess && values.electionIds.length > 0) {
      const validElections = await db.election.findMany({
        where: { id: { in: values.electionIds }, organizationId: orgId, deletedAt: null },
        select: { id: true }
      })
      validElectionIds = validElections.map(e => e.id)
    }

    await db.$transaction(async (tx) => {
      // Update custom User role & global access flag
      await tx.user.update({
        where: { id: values.userId },
        data: { 
          role: values.role,
          hasAllElectionsAccess: values.hasAllAccess 
        }
      })

      // Clear existing access
      await tx.userElectionAccess.deleteMany({
        where: { userId: values.userId }
      })

      // Add granular access if not full access
      if (!values.hasAllAccess && validElectionIds.length > 0) {
        await tx.userElectionAccess.createMany({
          data: validElectionIds.map(electionId => ({
            userId: values.userId,
            electionId,
            createdByUserId: adminId,
            updatedByUserId: adminId
          }))
        })
      }

      // Log the change
      await logAdminAction({
        action: "MEMBER_ACCESS_UPDATED",
        entityType: AuditEntityType.USER,
        entityId: values.userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { role: values.role, hasAllAccess: values.hasAllAccess, electionIds: validElectionIds }
      })
    })

    revalidatePath("/organisation/members")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_MEMBER_ACCESS]", error)
    try {
      await logAdminAction({
        action: "MEMBER_ACCESS_UPDATED",
        entityType: AuditEntityType.USER,
        entityId: userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { role, hasAllAccess, error: error?.message || "Unknown error" }
      })
    } catch(e) {}
    return { success: false, error: "Failed to update member access" }
  }
}

/**
 * Gets elections for the active organization to populate the multi-select dropdown.
 */
export async function getElectionsForAssignment() {
  try {
    const { organizationId: orgId } = await requireOrgActionContext({
      action: "ELECTION_ASSIGNMENT_OPTIONS_LISTED",
      entityType: AuditEntityType.ELECTION,
    })

    const elections = await db.election.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, elections }
  } catch (error) {
    console.error("[GET_ELECTIONS_FOR_ASSIGNMENT]", error)
    return { success: false, error: "Failed to fetch elections", elections: [] }
  }
}

/**
 * Removes a member from the organization and cleans up their custom roles and election access.
 */
export async function removeMemberAction(userId: string) {
  let adminId: string | null = null
  let orgId: string | null = null
  try {
    const parsed = RemoveMemberSchema.safeParse({ userId })
    if (!parsed.success) return { success: false, error: "Invalid member" }

    const access = await requireOrgActionContext({
      action: "MEMBER_REMOVED",
      entityType: AuditEntityType.MEMBER,
      entityId: userId,
    })
    adminId = access.userId
    orgId = access.organizationId

    const targetMember = await db.member.findFirst({
      where: { userId: parsed.data.userId, organizationId: orgId }
    })

    if (!targetMember) return { success: false, error: "Member not found in organization" }

    // Remove from Better Auth organization
    await auth.api.removeMember({
      headers: await headers(),
      body: {
        memberIdOrEmail: targetMember.id,
        organizationId: orgId
      }
    })

    // Perform custom updates in a transaction
    await db.$transaction(async (tx) => {
      // Clear their custom role and full access flag globally
      await tx.user.update({
        where: { id: parsed.data.userId },
        data: {
          role: "user",
          hasAllElectionsAccess: false
        }
      })

      // Delete all granular election access for this user
      await tx.userElectionAccess.deleteMany({
        where: { userId: parsed.data.userId }
      })

      // Log the removal
      await logAdminAction({
        action: "MEMBER_REMOVED",
        entityType: AuditEntityType.USER,
        entityId: parsed.data.userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { memberId: targetMember.id }
      })
    })

    revalidatePath("/organisation/members")
    return { success: true }
  } catch (error: any) {
    console.error("[REMOVE_MEMBER]", error)
    try {
      await logAdminAction({
        action: "MEMBER_REMOVED",
        entityType: AuditEntityType.USER,
        entityId: userId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { error: error?.message || "Unknown error" }
      })
    } catch(e) {}
    return { success: false, error: error.message || "Failed to remove member" }
  }
}
