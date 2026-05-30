"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import { CategorySchema, type CategoryFormValues } from "@/lib/schemas/category"
import { randomBytes } from "crypto"

// ─── Code generator: {electionCode}-XXXX ─────────────────────────────────────

function generateCategoryCode(electionCode: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(4)
  const suffix = Array.from(bytes, (b) => chars[b % chars.length]).join("")
  return `${electionCode}-${suffix}`
}

// ─── Guard: is this the default category? ─────────────────────────────────────

async function assertNotDefaultCategory(categoryId: string, electionId: string) {
  const cat = await db.electionCategory.findFirst({
    where: { id: categoryId, electionId },
    include: { election: { select: { code: true } } },
  })
  if (!cat) throw new Error("Category not found")
  if (cat.code === cat.election.code) {
    throw new Error("The default category cannot be modified or deleted")
  }
  return cat
}

// ─── Guard: block mutations if ballots exist ──────────────────────────────────

async function assertNoBallots(electionId: string) {
  const count = await db.ballot.count({ where: { electionId } })
  if (count > 0) {
    throw new Error(
      "Categories cannot be modified after ballots have been recorded for this election."
    )
  }
}

// ─── Create Category ──────────────────────────────────────────────────────────

export async function createCategory(electionId: string, data: CategoryFormValues) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CATEGORY_CREATED",
      entityType: AuditEntityType.ELECTION_CATEGORY,
      entityId: electionId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = CategorySchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.name?.[0] || "Invalid category details",
      }
    }
    const { name, roleIds } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify election belongs to this org
      const election = await tx.election.findFirst({
        where: { id: electionId, organizationId, deletedAt: null },
        select: { id: true, code: true },
      })
      if (!election) throw new Error("Election not found")

      // Block if ballots exist
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Categories cannot be added after ballots have been recorded for this election."
        )
      }

      // Generate a unique category code
      let code = generateCategoryCode(election.code)
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await tx.electionCategory.findFirst({
          where: { electionId, code },
          select: { id: true },
        })
        if (!exists) break
        code = generateCategoryCode(election.code)
      }

      // Verify roleIds belong to this election
      if (roleIds.length > 0) {
        const validCount = await tx.electionRole.count({
          where: { id: { in: roleIds }, electionId },
        })
        if (validCount !== roleIds.length) {
          throw new Error("One or more selected roles are invalid")
        }
      }

      const category = await tx.electionCategory.create({
        data: {
          electionId,
          name,
          code,
          createdByUserId: userId,
          updatedByUserId: userId,
          roles: {
            connect: roleIds.map((id) => ({ id })),
          },
        },
      })

      await logAdminAction({
        action: "CATEGORY_CREATED",
        entityType: AuditEntityType.ELECTION_CATEGORY,
        entityId: category.id,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name, code, roleIds },
      })

      return category
    })

    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true, category: result }
  } catch (error: any) {
    console.error("[CREATE_CATEGORY]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CATEGORY_CREATED",
          entityType: AuditEntityType.ELECTION_CATEGORY,
          entityId: electionId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to create category" }
  }
}

// ─── Update Category ──────────────────────────────────────────────────────────

export async function updateCategory(
  categoryId: string,
  electionId: string,
  data: CategoryFormValues
) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CATEGORY_UPDATED",
      entityType: AuditEntityType.ELECTION_CATEGORY,
      entityId: categoryId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = CategorySchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.name?.[0] || "Invalid category details",
      }
    }
    const { name, roleIds } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Block if default category
      const existing = await tx.electionCategory.findFirst({
        where: {
          id: categoryId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        include: { election: { select: { code: true } } },
      })
      if (!existing) throw new Error("Category not found")
      if (existing.code === existing.election.code) {
        throw new Error("The default category cannot be modified")
      }

      // Block if ballots exist
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Categories cannot be modified after ballots have been recorded for this election."
        )
      }

      // Verify roleIds belong to this election
      if (roleIds.length > 0) {
        const validCount = await tx.electionRole.count({
          where: { id: { in: roleIds }, electionId },
        })
        if (validCount !== roleIds.length) {
          throw new Error("One or more selected roles are invalid")
        }
      }

      const updated = await tx.electionCategory.update({
        where: { id: categoryId },
        data: {
          name,
          updatedByUserId: userId,
          roles: {
            set: roleIds.map((id) => ({ id })),
          },
        },
      })

      await logAdminAction({
        action: "CATEGORY_UPDATED",
        entityType: AuditEntityType.ELECTION_CATEGORY,
        entityId: categoryId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          before: { name: existing.name },
          after: { name, roleIds },
        },
      })

      return updated
    })

    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true, category: result }
  } catch (error: any) {
    console.error("[UPDATE_CATEGORY]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CATEGORY_UPDATED",
          entityType: AuditEntityType.ELECTION_CATEGORY,
          entityId: categoryId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to update category" }
  }
}

// ─── Delete Category ──────────────────────────────────────────────────────────

export async function deleteCategory(categoryId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CATEGORY_DELETED",
      entityType: AuditEntityType.ELECTION_CATEGORY,
      entityId: categoryId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      // Verify category belongs to this election + org
      const category = await tx.electionCategory.findFirst({
        where: {
          id: categoryId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        include: { election: { select: { code: true } } },
      })
      if (!category) throw new Error("Category not found")
      if (category.code === category.election.code) {
        throw new Error("The default category cannot be deleted")
      }

      // Block if ballots exist
      const ballotCount = await tx.ballot.count({ where: { electionId } })
      if (ballotCount > 0) {
        throw new Error(
          "Categories cannot be deleted after ballots have been recorded for this election."
        )
      }

      await logAdminAction({
        action: "CATEGORY_DELETED",
        entityType: AuditEntityType.ELECTION_CATEGORY,
        entityId: categoryId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name: category.name, code: category.code },
      })

      await tx.electionCategory.delete({ where: { id: categoryId } })
    })

    revalidatePath(`/organisation/election/${electionId}/categories`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_CATEGORY]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CATEGORY_DELETED",
          entityType: AuditEntityType.ELECTION_CATEGORY,
          entityId: categoryId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete category" }
  }
}
