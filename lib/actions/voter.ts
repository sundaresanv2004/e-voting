"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus, Prisma } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import { VoterSchema, type VoterFormValues } from "@/lib/schemas/voter"
import { randomBytes } from "crypto"

// ─── Unique ID generator ──────────────────────────────────────────────────────

async function generateSafeUniqueId(electionId: string): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let isUnique = false
  let code = ""

  while (!isUnique) {
    const bytes = randomBytes(8)
    const raw = Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
    code = raw.slice(0, 4) + "-" + raw.slice(4, 8)

    const existing = await db.voter.findUnique({
      where: { electionId_uniqueId: { electionId, uniqueId: code } },
    })
    if (!existing) isUnique = true
  }

  return code
}

// ─── Public: generate a code for the UI shuffle button ───────────────────────

export async function getNewUniqueCode(electionId: string) {
  try {
    await requireOrgActionContext({
      action: "VOTER_ID_GENERATE",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    const code = await generateSafeUniqueId(electionId)
    return { code }
  } catch (error: any) {
    return { error: error.message || "Failed to generate code" }
  }
}

// ─── Audit: log when a voter ID is copied ────────────────────────────────────

export async function logVoterIdAccess(
  electionId: string,
  voterId: string,
  action: "copied"
) {
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_ID_COPIED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })

    await logAdminAction({
      action: "VOTER_ID_COPIED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminId: access.userId,
      organizationId: access.organizationId,
      status: AuditStatus.SUCCESS,
      metadata: { voterId, action },
    })

    return { success: true }
  } catch {
    return { error: "Failed to log access" }
  }
}

// ─── Create Voter ─────────────────────────────────────────────────────────────

export async function createVoter(electionId: string, data: VoterFormValues) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_CREATED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = VoterSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid voter details" }
    }
    const { name, uniqueId: providedId, categoryId } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify election belongs to org
      const election = await tx.election.findFirst({
        where: { id: electionId, organizationId, deletedAt: null },
      })
      if (!election) throw new Error("Election not found")

      // Resolve unique ID
      const uniqueId =
        providedId && providedId.trim() !== ""
          ? providedId.trim()
          : await generateSafeUniqueId(electionId)

      // Check uniqueness within this election
      const existing = await tx.voter.findUnique({
        where: { electionId_uniqueId: { electionId, uniqueId } },
      })
      if (existing) {
        throw new Error("This Unique ID is already assigned to another voter in this election")
      }

      // Validate categoryId if provided
      let resolvedCategoryId: string | null = null
      if (categoryId && categoryId.trim() !== "") {
        const cat = await tx.electionCategory.findFirst({
          where: { id: categoryId, electionId },
        })
        if (!cat) throw new Error("Selected category not found")
        resolvedCategoryId = categoryId
      }

      const voter = await tx.voter.create({
        data: {
          electionId,
          name,
          uniqueId,
          categoryId: resolvedCategoryId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "VOTER_CREATED",
        entityType: AuditEntityType.ELECTION,
        entityId: electionId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name, uniqueId, categoryId: resolvedCategoryId },
      })

      return voter
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true, voter: result }
  } catch (error: any) {
    console.error("[CREATE_VOTER]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_CREATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to create voter" }
  }
}

// ─── Update Voter ─────────────────────────────────────────────────────────────

export async function updateVoter(
  voterId: string,
  electionId: string,
  data: VoterFormValues
) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_UPDATED",
      entityType: AuditEntityType.ELECTION,
      entityId: voterId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = VoterSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "Invalid voter details" }
    }
    const { name, uniqueId: providedId, categoryId } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify voter belongs to this election and org
      const existing = await tx.voter.findFirst({
        where: {
          id: voterId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        select: { name: true, uniqueId: true, categoryId: true },
      })
      if (!existing) throw new Error("Voter not found")

      // Resolve unique ID
      const uniqueId =
        providedId && providedId.trim() !== ""
          ? providedId.trim()
          : existing.uniqueId

      // Check uniqueness (excluding self)
      const duplicate = await tx.voter.findFirst({
        where: {
          electionId,
          uniqueId,
          NOT: { id: voterId },
        },
      })
      if (duplicate) {
        throw new Error("Another voter with this Unique ID already exists in this election")
      }

      // Validate categoryId
      let resolvedCategoryId: string | null = null
      if (categoryId && categoryId.trim() !== "") {
        const cat = await tx.electionCategory.findFirst({
          where: { id: categoryId, electionId },
        })
        if (!cat) throw new Error("Selected category not found")
        resolvedCategoryId = categoryId
      }

      const updated = await tx.voter.update({
        where: { id: voterId },
        data: {
          name,
          uniqueId,
          categoryId: resolvedCategoryId,
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "VOTER_UPDATED",
        entityType: AuditEntityType.ELECTION,
        entityId: voterId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          before: existing,
          after: { name, uniqueId, categoryId: resolvedCategoryId },
        },
      })

      return updated
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true, voter: result }
  } catch (error: any) {
    console.error("[UPDATE_VOTER]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: voterId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to update voter" }
  }
}

// ─── Delete Voter ─────────────────────────────────────────────────────────────

export async function deleteVoter(voterId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_DELETED",
      entityType: AuditEntityType.ELECTION,
      entityId: voterId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      const voter = await tx.voter.findFirst({
        where: {
          id: voterId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        include: { _count: { select: { ballots: true } } },
      })
      if (!voter) throw new Error("Voter not found")

      if (voter._count.ballots > 0) {
        throw new Error(
          "This voter cannot be removed because they have already cast a ballot."
        )
      }

      await logAdminAction({
        action: "VOTER_DELETED",
        entityType: AuditEntityType.ELECTION,
        entityId: voterId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name: voter.name, uniqueId: voter.uniqueId },
      })

      await tx.voter.delete({ where: { id: voterId } })
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_VOTER]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_DELETED",
          entityType: AuditEntityType.ELECTION,
          entityId: voterId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete voter" }
  }
}

// ─── Reset Voter Vote ─────────────────────────────────────────────────────────

export async function resetVoterVote(voterId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_VOTE_RESET",
      entityType: AuditEntityType.ELECTION,
      entityId: voterId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      const voter = await tx.voter.findFirst({
        where: {
          id: voterId,
          electionId,
          election: { organizationId, deletedAt: null },
        },
        include: { ballots: { select: { id: true } } },
      })
      if (!voter) throw new Error("Voter not found")
      if (voter.ballots.length === 0) throw new Error("This voter has not cast a vote yet")

      const ballotIds = voter.ballots.map((b) => b.id)

      // Must delete Vote records first due to onDelete: Restrict on Ballot
      await tx.vote.deleteMany({
        where: { ballotId: { in: ballotIds } },
      })

      // Now safe to delete the ballot(s)
      await tx.ballot.deleteMany({
        where: { id: { in: ballotIds } },
      })

      // Reset voter counters
      await tx.voter.update({
        where: { id: voterId },
        data: { ballotCount: 0, lastVotedAt: null },
      })

      await logAdminAction({
        action: "VOTER_VOTE_RESET",
        entityType: AuditEntityType.ELECTION,
        entityId: voterId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name: voter.name, uniqueId: voter.uniqueId },
      })
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true }
  } catch (error: any) {
    console.error("[RESET_VOTER_VOTE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_VOTE_RESET",
          entityType: AuditEntityType.ELECTION,
          entityId: voterId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to reset voter vote" }
  }
}

// ─── Delete Anonymous Ballot ──────────────────────────────────────────────────

export async function deleteAnonymousBallot(ballotId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_VOTE_RESET",
      entityType: AuditEntityType.ELECTION,
      entityId: ballotId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      const ballot = await tx.ballot.findFirst({
        where: {
          id: ballotId,
          electionId,
          isAnonymous: true,
          election: { organizationId, deletedAt: null },
        },
      })
      if (!ballot) throw new Error("Anonymous ballot not found")

      // Must delete Vote records first due to onDelete: Restrict on Ballot
      await tx.vote.deleteMany({
        where: { ballotId },
      })

      // Now safe to delete the ballot
      await tx.ballot.delete({
        where: { id: ballotId },
      })

      await logAdminAction({
        action: "VOTER_VOTE_RESET",
        entityType: AuditEntityType.ELECTION,
        entityId: ballotId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, submissionKey: ballot.submissionKey, isAnonymous: true },
      })
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ANONYMOUS_BALLOT]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_VOTE_RESET",
          entityType: AuditEntityType.ELECTION,
          entityId: ballotId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete anonymous ballot" }
  }
}

// ─── Delete Ballots by IP ─────────────────────────────────────────────────────

export async function deleteBallotsByIp(electionId: string, ipAddress: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTER_VOTE_RESET",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      // Find all ballots matching this IP for this election
      const ballots = await tx.ballot.findMany({
        where: {
          electionId,
          ipAddress,
          deletedAt: null,
          election: { organizationId, deletedAt: null },
        },
        select: { id: true, voterId: true, isAnonymous: true },
      })

      if (ballots.length === 0) {
        throw new Error("No ballots found for this IP address")
      }

      const ballotIds = ballots.map((b) => b.id)
      const voterIds = ballots.map((b) => b.voterId).filter(Boolean) as string[]

      // Must delete Vote records first due to onDelete: Restrict on Ballot
      await tx.vote.deleteMany({
        where: { ballotId: { in: ballotIds } },
      })

      // Now safe to delete the ballots
      await tx.ballot.deleteMany({
        where: { id: { in: ballotIds } },
      })

      // Reset any registered voters affected
      if (voterIds.length > 0) {
        await tx.voter.updateMany({
          where: { id: { in: voterIds } },
          data: { ballotCount: 0, lastVotedAt: null },
        })
      }

      await logAdminAction({
        action: "VOTER_VOTE_RESET",
        entityType: AuditEntityType.ELECTION,
        entityId: electionId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          ipAddress,
          deletedBallotCount: ballotIds.length,
          resetVoterCount: voterIds.length,
        },
      })
    })

    revalidatePath(`/organisation/election/${electionId}/results`)
    revalidatePath(`/organisation/election/${electionId}/voters`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_BALLOTS_BY_IP]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTER_VOTE_RESET",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error", ipAddress },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete ballots by IP" }
  }
}

// ─── Verify Bulk ──────────────────────────────────────────────────────────────

export async function verifyVotersBulk(
  electionId: string,
  voterData: any[],
  availableCategories: { id: string; code: string; name: string }[]
) {
  try {
    await requireOrgActionContext({
      action: "VOTERS_BULK_VERIFY",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })

    // Build a code → category map
    const categoryByCode = new Map(
      availableCategories.map((c) => [c.code.toLowerCase().trim(), c])
    )

    // Find duplicates against existing voters
    const providedIds = voterData
      .filter((v) => v.unique_id && String(v.unique_id).trim() !== "")
      .map((v) => String(v.unique_id).trim())

    const existingVoters =
      providedIds.length > 0
        ? await db.voter.findMany({
            where: { electionId, uniqueId: { in: providedIds } },
            select: { uniqueId: true },
          })
        : []

    const existingIdSet = new Set(existingVoters.map((v) => v.uniqueId))

    const duplicates = voterData.filter(
      (v) => v.unique_id && existingIdSet.has(String(v.unique_id).trim())
    )
    const missingIdCount = voterData.filter(
      (v) => !v.unique_id || String(v.unique_id).trim() === ""
    ).length

    // Analyse category column
    let invalidCategoryCount = 0
    const categorySummary: Record<string, number> = { "Any Category (Global)": 0 }

    for (const v of voterData) {
      const rawCode = v.category ? String(v.category).trim() : ""
      if (!rawCode) {
        categorySummary["Any Category (Global)"] =
          (categorySummary["Any Category (Global)"] ?? 0) + 1
      } else {
        const matched = categoryByCode.get(rawCode.toLowerCase())
        if (matched) {
          categorySummary[matched.name] = (categorySummary[matched.name] ?? 0) + 1
        } else {
          invalidCategoryCount++
          categorySummary["Any Category (Global)"] =
            (categorySummary["Any Category (Global)"] ?? 0) + 1
        }
      }
    }

    return {
      success: true,
      total: voterData.length,
      cleanCount: voterData.length - duplicates.length,
      duplicateCount: duplicates.length,
      missingIdCount,
      invalidCategoryCount,
      categorySummary,
      duplicates: duplicates.map((d) => ({
        uniqueId: String(d.unique_id),
        name: String(d.name),
      })),
    }
  } catch (error: any) {
    console.error("[VERIFY_VOTERS_BULK]", error)
    return { error: error.message || "Failed to verify data" }
  }
}

// ─── Import Bulk ──────────────────────────────────────────────────────────────

export async function importVotersBulk(
  electionId: string,
  voterData: any[],
  availableCategories: { id: string; code: string }[]
) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "VOTERS_BULK_IMPORT",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    // Build code → id map
    const categoryByCode = new Map(
      availableCategories.map((c) => [c.code.toLowerCase().trim(), c.id])
    )

    // Verify election
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId, deletedAt: null },
    })
    if (!election) throw new Error("Election not found")

    const data: Prisma.VoterCreateManyInput[] = []
    const generatedInBatch = new Set<string>()

    for (const v of voterData) {
      const rawId = v.unique_id ? String(v.unique_id).trim() : ""
      let finalUniqueId = rawId !== "" ? rawId : null

      if (!finalUniqueId) {
        let isBatchUnique = false
        while (!isBatchUnique) {
          const newId = await generateSafeUniqueId(electionId)
          if (!generatedInBatch.has(newId)) {
            finalUniqueId = newId
            generatedInBatch.add(newId)
            isBatchUnique = true
          }
        }
      }

      // Resolve category
      const rawCode = v.category ? String(v.category).trim().toLowerCase() : ""
      const resolvedCategoryId = rawCode
        ? (categoryByCode.get(rawCode) ?? null)
        : null

      // Extract extra details into a JSON object
      const standardKeys = ["name", "unique_id", "category", "image"]
      const additionalDetails: Record<string, any> = {}
      for (const [key, value] of Object.entries(v)) {
        if (!standardKeys.includes(key.toLowerCase().trim())) {
          additionalDetails[key] = value
        }
      }

      data.push({
        electionId,
        uniqueId: finalUniqueId as string,
        name: String(v.name),
        image: v.image ? String(v.image) : null,
        categoryId: resolvedCategoryId,
        additionalDetails: Object.keys(additionalDetails).length > 0 ? additionalDetails : Prisma.DbNull,
        createdByUserId: userId,
        updatedByUserId: userId,
      })
    }

    const result = await db.$transaction(async (tx) => {
      const importResult = await tx.voter.createMany({
        data,
        skipDuplicates: true,
      })

      await logAdminAction({
        action: "VOTERS_BULK_IMPORT",
        entityType: AuditEntityType.ELECTION,
        entityId: electionId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { count: importResult.count },
      })

      return importResult
    })

    revalidatePath(`/organisation/election/${electionId}/voters`)
    return {
      success: true,
      count: result.count,
      message: `Successfully imported ${result.count} voter${result.count !== 1 ? "s" : ""}.`,
    }
  } catch (error: any) {
    console.error("[IMPORT_VOTERS_BULK]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "VOTERS_BULK_IMPORT",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Bulk import failed" }
  }
}
