"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus } from "@prisma/client"

/**
 * Gets all members for the active organization, including their custom user fields
 * like electionAccess and hasAllElectionsAccess.
 */
export async function getOrganizationMembers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const orgId = session.session.activeOrganizationId
  if (!orgId) return { success: false, error: "No active organization" }

  try {
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
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const orgId = session.session.activeOrganizationId
  if (!orgId) return { success: false, error: "No active organization" }

  const normalizedQuery = query.trim()

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
      const isAlreadyInThisOrg = user.members.some(m => m.organizationId === orgId)
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
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const adminId = session.user.id
  const orgId = session.session.activeOrganizationId
  if (!orgId) return { success: false, error: "No active organization" }

  try {
    // 1. Verify target user
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { members: true }
    })
    
    if (!user) return { success: false, error: "User not found" }
    
    // Check if they are in another organization
    const isAlreadyInThisOrg = user.members.some(m => m.organizationId === orgId)
    const isAlreadyInAnotherOrg = user.members.length > 0 && !isAlreadyInThisOrg
    
    if (isAlreadyInThisOrg) return { success: false, error: "User is already in this organization" }
    if (isAlreadyInAnotherOrg) return { success: false, error: "This user belongs to a different org. They need to leave it to join yours." }

    // Map custom roles to Better Auth organization roles (admin vs member)
    const betterAuthRole = role === "org_admin" ? "admin" : "member"

    // Add to Better Auth Member table natively
    await auth.api.addMember({
      headers: await headers(), // Ensure we use auth headers
      body: {
        userId,
        organizationId: orgId,
        role: betterAuthRole,
      }
    })

    // Prepare valid election IDs
    let validElectionIds: string[] = []
    if (!hasAllAccess && electionIds.length > 0) {
      const validElections = await db.election.findMany({
        where: { id: { in: electionIds }, organizationId: orgId },
        select: { id: true }
      })
      validElectionIds = validElections.map(e => e.id)
    }

    // 2. Perform custom updates in a transaction
    await db.$transaction(async (tx) => {
      // Update User table with custom role
      await tx.user.update({
        where: { id: userId },
        data: {
          role: role as any, // "org_admin" | "staff" | "viewer" are part of Prisma UserRole enum
          hasAllElectionsAccess: hasAllAccess
        }
      })

      // Add granular election access if not full access
      if (!hasAllAccess && validElectionIds.length > 0) {
        await tx.userElectionAccess.createMany({
          data: validElectionIds.map(id => ({
            userId,
            electionId: id,
            createdByUserId: adminId,
            updatedByUserId: adminId
          }))
        })
      }

      // Log the addition
      await tx.adminAuditLog.create({
        data: {
          action: "MEMBER_ADDED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.SUCCESS,
          metadata: { role, hasAllAccess, electionIds: validElectionIds }
        }
      })
    })

    revalidatePath("/organisation/members")
    return { success: true }
  } catch (error: any) {
    console.error("[ADD_MEMBER]", error)
    try {
      await db.adminAuditLog.create({
        data: {
          action: "MEMBER_ADDED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { role, hasAllAccess, error: error?.message || "Unknown error" }
        }
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
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const orgId = session.session.activeOrganizationId
  if (!orgId) return { success: false, error: "No active organization" }
  const adminId = session.user.id

  try {
    const targetMember = await db.member.findFirst({
      where: { userId, organizationId: orgId }
    })

    if (!targetMember) return { success: false, error: "Member not found in organization" }

    // Map to Better Auth role
    const betterAuthRole = role === "org_admin" ? "admin" : "member"
    if (targetMember.role !== betterAuthRole) {
      await auth.api.updateMemberRole({
        headers: await headers(),
        body: {
          memberId: targetMember.id,
          role: betterAuthRole
        }
      })
    }

    // Verify electionIds belong to this org
    let validElectionIds: string[] = []
    if (!hasAllAccess && electionIds.length > 0) {
      const validElections = await db.election.findMany({
        where: { id: { in: electionIds }, organizationId: orgId },
        select: { id: true }
      })
      validElectionIds = validElections.map(e => e.id)
    }

    await db.$transaction(async (tx) => {
      // Update custom User role & global access flag
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: role as any,
          hasAllElectionsAccess: hasAllAccess 
        }
      })

      // Clear existing access
      await tx.userElectionAccess.deleteMany({
        where: { userId }
      })

      // Add granular access if not full access
      if (!hasAllAccess && validElectionIds.length > 0) {
        await tx.userElectionAccess.createMany({
          data: validElectionIds.map(electionId => ({
            userId,
            electionId,
            createdByUserId: adminId,
            updatedByUserId: adminId
          }))
        })
      }

      // Log the change
      await tx.adminAuditLog.create({
        data: {
          action: "MEMBER_ACCESS_UPDATED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.SUCCESS,
          metadata: { role, hasAllAccess, electionIds: validElectionIds }
        }
      })
    })

    revalidatePath("/organisation/members")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_MEMBER_ACCESS]", error)
    try {
      await db.adminAuditLog.create({
        data: {
          action: "MEMBER_ACCESS_UPDATED",
          entityType: AuditEntityType.USER,
          entityId: userId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { role, hasAllAccess, error: error?.message || "Unknown error" }
        }
      })
    } catch(e) {}
    return { success: false, error: "Failed to update member access" }
  }
}

/**
 * Gets elections for the active organization to populate the multi-select dropdown.
 */
export async function getElectionsForAssignment() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized", elections: [] }
  const orgId = session.session.activeOrganizationId
  if (!orgId) return { success: false, error: "No active organization", elections: [] }

  try {
    const elections = await db.election.findMany({
      where: { organizationId: orgId },
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
