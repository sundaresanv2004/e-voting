"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"

import { RoleSchema, type RoleFormValues } from "@/lib/schemas/role"
import { requireElectionAccess } from "@/lib/authz"

async function electionHasBallots(electionId: string) {
  const ballotCount = await db.ballot.count({
    where: { electionId },
  })

  return ballotCount > 0
}

export async function createRole(electionId: string, data: RoleFormValues) {
  const session = await auth()
  const access = await requireElectionAccess(session?.user, electionId, [
    UserRole.ORG_ADMIN,
    UserRole.STAFF,
  ])

  try {
    const validatedFields = RoleSchema.safeParse(data)
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid role details" 
      }
    }

    const { name, order, allSystems, systemIds } = validatedFields.data

    // Verify election belongs to organization
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId: access.organizationId }
    })
    if (!election) throw new Error("Election not found")

    if (await electionHasBallots(electionId)) {
      throw new Error("Roles cannot be added after ballots have been recorded for this election.")
    }

    // Check if order is already taken in this election
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${order} is already taken by "${existingOrder.name}"`)
    }

    // Prepare system relations
    const finalSystemIds = allSystems ? [] : systemIds

    // Verify all systemIds belong to the same organization
    if (finalSystemIds.length > 0) {
      const authorizedSystems = await db.authorizedSystem.count({
        where: {
          id: { in: finalSystemIds },
          organizationId: access.organizationId
        }
      })
      if (authorizedSystems !== finalSystemIds.length) {
        throw new Error("One or more selected systems are invalid")
      }
    }

    const role = await db.$transaction(async (tx) => {
      const role = await tx.electionRole.create({
        data: {
          electionId,
          name,
          order,
          createdByUserId: access.userId,
          updatedByUserId: access.userId,
          allowedSystems: {
            connect: finalSystemIds.map(id => ({ id }))
          }
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ROLE_CREATED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { roleId: role.id, electionId, name, order, systemIds: finalSystemIds },
        },
      })

      return role
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true, role }
  } catch (error: any) {
    console.error("[CREATE_ROLE]", error)
    return { success: false, error: error.message || "Failed to create role" }
  }
}

export async function updateRole(roleId: string, electionId: string, data: RoleFormValues) {
  const session = await auth()
  const access = await requireElectionAccess(session?.user, electionId, [
    UserRole.ORG_ADMIN,
    UserRole.STAFF,
  ])

  try {
    const validatedFields = RoleSchema.safeParse(data)
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid role details" 
      }
    }

    const { name, order, allSystems, systemIds } = validatedFields.data

    // Verify role belongs to organization through election
    const role = await db.electionRole.findFirst({
      where: { 
        id: roleId,
        electionId,
        election: { organizationId: access.organizationId }
      }
    })
    if (!role) throw new Error("Role not found")

    if (await electionHasBallots(electionId)) {
      throw new Error("Roles cannot be changed after ballots have been recorded for this election.")
    }

    // Check if order is taken by another role
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order,
        NOT: { id: roleId }
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${order} is already taken by "${existingOrder.name}"`)
    }

    // Prepare system relations
    const finalSystemIds = allSystems ? [] : systemIds

    // Verify all systemIds belong to the same organization
    if (finalSystemIds.length > 0) {
      const authorizedSystems = await db.authorizedSystem.count({
        where: {
          id: { in: finalSystemIds },
          organizationId: access.organizationId
        }
      })
      if (authorizedSystems !== finalSystemIds.length) {
        throw new Error("One or more selected systems are invalid")
      }
    }

    const updatedRole = await db.$transaction(async (tx) => {
      const updatedRole = await tx.electionRole.update({
        where: { id: roleId },
        data: {
          name,
          order,
          updatedByUserId: access.userId,
          allowedSystems: {
            set: finalSystemIds.map(id => ({ id }))
          }
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ROLE_UPDATED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: {
            roleId,
            electionId,
            before: { name: role.name, order: role.order },
            after: { name, order, systemIds: finalSystemIds },
          },
        },
      })

      return updatedRole
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true, role: updatedRole }
  } catch (error: any) {
    console.error("[UPDATE_ROLE]", error)
    return { success: false, error: error.message || "Failed to update role" }
  }
}

export async function deleteRole(roleId: string, electionId: string) {
  const session = await auth()
  const access = await requireElectionAccess(session?.user, electionId, [
    UserRole.ORG_ADMIN,
    UserRole.STAFF,
  ])

  try {
    // Verify role belongs to organization
    const role = await db.electionRole.findFirst({
      where: { 
        id: roleId,
        electionId,
        election: { organizationId: access.organizationId }
      },
      include: {
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
    })
    if (!role) throw new Error("Role not found")

    if (role._count.votes > 0 || await electionHasBallots(electionId)) {
      throw new Error("This role cannot be deleted after voting has started because it would change recorded results.")
    }

    await db.$transaction(async (tx) => {
      await tx.adminAuditLog.create({
        data: {
          action: "ROLE_DELETED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { roleId, electionId, name: role.name, order: role.order, candidateCount: role._count.candidates },
        },
      })

      await tx.electionRole.delete({
        where: { id: roleId }
      })
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ROLE]", error)
    return { success: false, error: error.message || "Failed to delete role" }
  }
}
