"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import { CandidateSchema, type CandidateFormValues } from "@/lib/schemas/candidate"

// ─── Guard: block mutations if ballots exist ──────────────────────────────────

async function assertNoBallots(electionId: string, tx: any) {
  const count = await tx.ballot.count({ where: { electionId } })
  if (count > 0) {
    throw new Error(
      "Candidates cannot be modified after ballots have been recorded for this election."
    )
  }
}

// ─── Create Candidate ─────────────────────────────────────────────────────────

export async function createCandidate(electionId: string, data: CandidateFormValues) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CANDIDATE_CREATED",
      entityType: AuditEntityType.CANDIDATE,
      entityId: "new",
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = CandidateSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid candidate details",
      }
    }
    const { name, electionRoleId, profileImage, symbolImage } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify election belongs to this org
      const election = await tx.election.findFirst({
        where: { id: electionId, organizationId, deletedAt: null },
      })
      if (!election) throw new Error("Election not found")

      await assertNoBallots(electionId, tx)

      // Verify role belongs to this election
      const role = await tx.electionRole.findFirst({
        where: {
          id: electionRoleId,
          electionId,
        },
      })
      if (!role) throw new Error("Invalid election role specified")

      const candidate = await tx.candidate.create({
        data: {
          electionRoleId,
          name,
          profileImage: profileImage || null,
          symbolImage: symbolImage || null,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "CANDIDATE_CREATED",
        entityType: AuditEntityType.CANDIDATE,
        entityId: candidate.id,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { electionId, name, electionRoleId },
      })

      return candidate
    })

    revalidatePath(`/organisation/election/${electionId}/candidates`)
    return { success: true, candidate: result }
  } catch (error: any) {
    console.error("[CREATE_CANDIDATE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CANDIDATE_CREATED",
          entityType: AuditEntityType.CANDIDATE,
          entityId: "new",
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to create candidate" }
  }
}

// ─── Update Candidate ─────────────────────────────────────────────────────────

export async function updateCandidate(
  candidateId: string,
  electionId: string,
  data: CandidateFormValues
) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CANDIDATE_UPDATED",
      entityType: AuditEntityType.CANDIDATE,
      entityId: candidateId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    const parsed = CandidateSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid candidate details",
      }
    }
    const { name, electionRoleId, profileImage, symbolImage } = parsed.data

    const result = await db.$transaction(async (tx) => {
      // Verify candidate belongs to this election and org
      const existing = await tx.candidate.findFirst({
        where: {
          id: candidateId,
          role: {
            electionId,
            election: { organizationId, deletedAt: null },
          },
        },
        select: { name: true, electionRoleId: true, profileImage: true, symbolImage: true },
      })
      if (!existing) throw new Error("Candidate not found")

      await assertNoBallots(electionId, tx)

      // Verify role belongs to this election
      const role = await tx.electionRole.findFirst({
        where: {
          id: electionRoleId,
          electionId,
        },
      })
      if (!role) throw new Error("Invalid election role specified")

      const updated = await tx.candidate.update({
        where: { id: candidateId },
        data: {
          name,
          electionRoleId,
          profileImage: profileImage || null,
          symbolImage: symbolImage || null,
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "CANDIDATE_UPDATED",
        entityType: AuditEntityType.CANDIDATE,
        entityId: candidateId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          before: existing,
          after: { name, electionRoleId, profileImage, symbolImage },
        },
      })

      return updated
    })

    revalidatePath(`/organisation/election/${electionId}/candidates`)
    return { success: true, candidate: result }
  } catch (error: any) {
    console.error("[UPDATE_CANDIDATE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CANDIDATE_UPDATED",
          entityType: AuditEntityType.CANDIDATE,
          entityId: candidateId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to update candidate" }
  }
}

// ─── Delete Candidate ─────────────────────────────────────────────────────────

export async function deleteCandidate(candidateId: string, electionId: string) {
  let adminId = ""
  let orgId = ""
  try {
    const access = await requireOrgActionContext({
      action: "CANDIDATE_DELETED",
      entityType: AuditEntityType.CANDIDATE,
      entityId: candidateId,
    })
    adminId = access.userId
    orgId = access.organizationId
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      // Verify candidate belongs to this election and org
      const candidate = await tx.candidate.findFirst({
        where: {
          id: candidateId,
          role: {
            electionId,
            election: { organizationId, deletedAt: null },
          },
        },
        include: { _count: { select: { votes: true } } },
      })
      if (!candidate) throw new Error("Candidate not found")

      await assertNoBallots(electionId, tx)

      // Block if votes exist
      if (candidate._count.votes > 0) {
        throw new Error(
          "This candidate cannot be deleted because votes have already been recorded for them."
        )
      }

      await logAdminAction({
        action: "CANDIDATE_DELETED",
        entityType: AuditEntityType.CANDIDATE,
        entityId: candidateId,
        adminId: userId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          electionId,
          name: candidate.name,
          electionRoleId: candidate.electionRoleId,
        },
      })

      await tx.candidate.delete({ where: { id: candidateId } })
    })

    revalidatePath(`/organisation/election/${electionId}/candidates`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_CANDIDATE]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "CANDIDATE_DELETED",
          entityType: AuditEntityType.CANDIDATE,
          entityId: candidateId,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" },
        })
      } catch {}
    }
    return { success: false, error: error.message || "Failed to delete candidate" }
  }
}
