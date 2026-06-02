"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import { RoleSchema, type RoleFormValues } from "@/lib/schemas/role"

// ─── Guard: block mutations if ballots exist ──────────────────────────────────

async function assertNoBallots(electionId: string) {
  const count = await db.ballot.count({ where: { electionId } })
  if (count > 0) {
    throw new Error(
      "Roles cannot be modified after ballots have been recorded for this election."
    )
  }
}

// ─── Create Role ──────────────────────────────────────────────────────────────

export async function createRole(electionId: string, data: RoleFormValues) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "ROLE_CREATED",
      entityType: AuditEntityType.ELECTION_ROLE,
      entityId: electionId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = RoleSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.name?.[0] ||
          parsed.error.flatten().fieldErrors.order?.[0] ||
          "Invalid role details",
      }
    }
    const { name, order, categoryIds } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify election belongs to this org
      const election = await tx.election.findFirst({
        where: { id: electionId, organizationId, deletedAt: null },
        select: { id: true, code: true },
      })
      if (!election) throw new Error("Election not found")

      // Check no ballots exist
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Roles cannot be added after ballots have been recorded for this election."
        )
      }

      // Ensure order is unique within this election
      const orderConflict = await tx.electionRole.findFirst({
        where: { electionId, order },
        select: { name: true },
      })
      if (orderConflict) {
        throw new Error(
          `Priority order ${order} is already taken by "${orderConflict.name}"`
        )
      }

      // Ensure name is unique within this election
      const nameConflict = await tx.electionRole.findFirst({
        where: { electionId, name },
        select: { id: true },
      })
      if (nameConflict) {
        throw new Error(`A role named "${name}" already exists in this election`)
      }

      // Find default category by matching code to election code
      const defCat = await tx.electionCategory.findFirst({
        where: { electionId, code: election.code },
        select: { id: true },
      })

      // Ensure default category is always connected
      const idsToConnect = new Set(categoryIds)
      if (defCat) idsToConnect.add(defCat.id)

      const role = await tx.electionRole.create({
        data: {
          electionId,
          name,
          order,
          createdByUserId: userId,
          updatedByUserId: userId,
          categories: {
            connect: Array.from(idsToConnect).map(id => ({ id }))
          }
        },
      })

      await logAdminAction({
        action: "ROLE_CREATED",
        entityType: AuditEntityType.ELECTION_ROLE,
        entityId: role.id,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name, order },
      })

      return role
    })

    revalidatePath(`/organisation/election/${electionId}/roles`)
    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true, role: result }
  } catch (error: any) {
    console.error("[CREATE_ROLE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ROLE_CREATED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: electionId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to create role" }
  }
}

// ─── Update Role ──────────────────────────────────────────────────────────────

export async function updateRole(
  roleId: string,
  electionId: string,
  data: RoleFormValues
) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "ROLE_UPDATED",
      entityType: AuditEntityType.ELECTION_ROLE,
      entityId: roleId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = RoleSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.name?.[0] ||
          parsed.error.flatten().fieldErrors.order?.[0] ||
          "Invalid role details",
      }
    }
    const { name, order, categoryIds } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify role belongs to this election and org
      const existing = await tx.electionRole.findFirst({
        where: {
          id: roleId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        select: { name: true, order: true },
      })
      if (!existing) throw new Error("Role not found")

      // Check no ballots exist
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Roles cannot be modified after ballots have been recorded for this election."
        )
      }

      // Ensure order not taken by a different role
      const orderConflict = await tx.electionRole.findFirst({
        where: { electionId, order, NOT: { id: roleId } },
        select: { name: true },
      })
      if (orderConflict) {
        throw new Error(
          `Priority order ${order} is already taken by "${orderConflict.name}"`
        )
      }

      // Ensure name not taken by a different role
      const nameConflict = await tx.electionRole.findFirst({
        where: { electionId, name, NOT: { id: roleId } },
        select: { id: true },
      })
      if (nameConflict) {
        throw new Error(`A role named "${name}" already exists in this election`)
      }

      // Find default category by matching code to election code
      const electionRecord = await tx.election.findFirst({
        where: { id: electionId },
        select: { code: true },
      })
      const defCat = electionRecord 
        ? await tx.electionCategory.findFirst({
            where: { electionId, code: electionRecord.code },
            select: { id: true },
          })
        : null

      // Ensure default category is always connected
      const idsToConnect = new Set(categoryIds)
      if (defCat) idsToConnect.add(defCat.id)

      const updated = await tx.electionRole.update({
        where: { id: roleId },
        data: { 
          name, 
          order, 
          updatedByUserId: userId,
          categories: {
            set: Array.from(idsToConnect).map(id => ({ id }))
          }
        },
      })

      await logAdminAction({
        action: "ROLE_UPDATED",
        entityType: AuditEntityType.ELECTION_ROLE,
        entityId: roleId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          before: { name: existing.name, order: existing.order },
          after: { name, order },
        },
      })

      return updated
    })

    revalidatePath(`/organisation/election/${electionId}/roles`)
    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true, role: result }
  } catch (error: any) {
    console.error("[UPDATE_ROLE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ROLE_UPDATED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: roleId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to update role" }
  }
}

// ─── Delete Role ──────────────────────────────────────────────────────────────

export async function deleteRole(roleId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "ROLE_DELETED",
      entityType: AuditEntityType.ELECTION_ROLE,
      entityId: roleId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      // Verify role belongs to this election and org
      const role = await tx.electionRole.findFirst({
        where: {
          id: roleId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        include: { _count: { select: { votes: true, candidates: true } } },
      })
      if (!role) throw new Error("Role not found")

      // Block if votes exist
      if (role._count.votes > 0) {
        throw new Error(
          "This role cannot be deleted because votes have already been recorded for it."
        )
      }

      // Block if any ballot exists for this election
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Roles cannot be deleted after ballots have been recorded for this election."
        )
      }

      await logAdminAction({
        action: "ROLE_DELETED",
        entityType: AuditEntityType.ELECTION_ROLE,
        entityId: roleId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          name: role.name,
          order: role.order,
          candidateCount: role._count.candidates,
        },
      })

      await tx.electionRole.delete({ where: { id: roleId } })
    })

    revalidatePath(`/organisation/election/${electionId}/roles`)
    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ROLE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ROLE_DELETED",
          entityType: AuditEntityType.ELECTION_ROLE,
          entityId: roleId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete role" }
  }
}
