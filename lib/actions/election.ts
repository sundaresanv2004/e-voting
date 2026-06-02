"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ElectionStatus, AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ElectionSchema } from "@/lib/schemas/election"
import { getCalculatedElectionStatus } from "@/lib/utils/election"
import { randomBytes } from "crypto"
import { requireOrgActionContext } from "@/lib/auth/access"

function generateCode(orgName: string = "EV") {
  const sanitized = orgName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const prefix = sanitized.length >= 3 ? sanitized.substring(0, 4) : "EV"

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  const result = Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
  return `${prefix}-${result}`
}

// C2: Defines the only permitted status transitions. Terminal states have no exits.
const VALID_TRANSITIONS: Record<string, ElectionStatus[]> = {
  [ElectionStatus.UPCOMING]:  [ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
  [ElectionStatus.ACTIVE]:    [ElectionStatus.PAUSED, ElectionStatus.COMPLETED, ElectionStatus.CANCELLED],
  [ElectionStatus.PAUSED]:    [ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
  [ElectionStatus.COMPLETED]: [], // terminal
  [ElectionStatus.CANCELLED]: [], // terminal
}

function assertValidTransition(current: ElectionStatus, next: ElectionStatus) {
  const allowed = VALID_TRANSITIONS[current] ?? []
  if (!allowed.includes(next)) {
    throw new Error(`Invalid status transition: ${current} → ${next}`)
  }
}

export async function createElection(formData: {
  name: string
  startTime: Date
  endTime: Date
}) {
  let adminId = "";
  let orgId = "";
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_CREATED",
      entityType: AuditEntityType.ELECTION,
    })
    adminId = access.userId;
    orgId = access.organizationId;
    const { userId, organizationId, organization } = access

    const validatedFields = ElectionSchema.safeParse(formData)

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid election details"
      }
    }

    const { name, startTime, endTime } = validatedFields.data

    const orgSettings = await db.organizationSettings.findUnique({
      where: { organizationId }
    })
    const maxElections = orgSettings?.maxElections ?? 5

    const currentElectionsCount = await db.election.count({
      where: { organizationId, deletedAt: null }
    })

    if (currentElectionsCount >= maxElections) {
      return {
        success: false,
        error: "LIMIT_REACHED",
        message: `You have reached the limit of ${maxElections} elections for your organization.`
      }
    }

    const result = await db.$transaction(async (tx) => {
      let code = generateCode(organization.name)
      let codeAvailable = false
      for (let attempt = 0; attempt < 5; attempt++) {
        const existing = await tx.election.findUnique({ where: { code } })
        if (!existing) {
          codeAvailable = true
          break
        }
        code = generateCode(organization.name)
      }
      if (!codeAvailable) throw new Error("Could not generate a unique election code")

      const election = await tx.election.create({
        data: {
          name: name,
          code,
          startTime: startTime,
          endTime: endTime,
          status: getCalculatedElectionStatus(startTime, endTime),
          organizationId: organizationId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      await tx.electionSettings.create({
        data: {
          electionId: election.id,
          allowOnlineVoting: false,
          authorizeVoters: true,
          showCandidateProfiles: true,
          showCandidateSymbols: true,
          shuffleCandidates: true,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      // Auto-create the default "General" category using the election code.
      // This category includes all roles and cannot be edited or deleted.
      await tx.electionCategory.create({
        data: {
          electionId: election.id,
          name: "General",
          code: election.code, // default category code === election code
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "ELECTION_CREATED",
        entityType: AuditEntityType.ELECTION,
        entityId: election.id,
        adminId: userId,
        organizationId: organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { name: election.name, startTime: election.startTime, endTime: election.endTime, code: election.code },
      })

      return election
    })

    const cookieStore = await cookies()
    cookieStore.set("last_election_id", result.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    })

    revalidatePath("/organisation/elections")
    return { success: true, election: result }
  } catch (error: any) {
    console.error("[CREATE_ELECTION_ACTION]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ELECTION_CREATED",
          entityType: AuditEntityType.ELECTION,
          entityId: "UNKNOWN",
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { formData, error: error?.message || "Unknown error" }
        })
      } catch (e) {}
    }
    return { success: false, error: error.message || "Failed to create election. Please try again." }
  }
}

export async function updateElection(
  id: string,
  formData: {
    name: string
    startTime: Date
    endTime: Date
  }
) {
  let adminId = "";
  let orgId = "";
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_UPDATED",
      entityType: AuditEntityType.ELECTION,
      entityId: id,
      adminOnly: false,
    })
    adminId = access.userId;
    orgId = access.organizationId;
    const { userId, organizationId } = access

    const validatedFields = ElectionSchema.safeParse(formData)

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid election details"
      }
    }

    const { name, startTime, endTime } = validatedFields.data

    const result = await db.$transaction(async (tx) => {
      const oldElection = await tx.election.findUnique({
        where: { id, organizationId, deletedAt: null },
        select: { name: true, startTime: true, endTime: true, status: true },
      })

      if (!oldElection) {
        throw new Error("Election not found")
      }

      const election = await tx.election.update({
        where: {
          id,
          organizationId
        },
        data: {
          name: name,
          startTime: startTime,
          endTime: endTime,
          status: getCalculatedElectionStatus(startTime, endTime),
          updatedByUserId: userId,
        },
      })

      await logAdminAction({
        action: "ELECTION_UPDATED",
        entityType: AuditEntityType.ELECTION,
        entityId: election.id,
        adminId: userId,
        organizationId: organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { old: oldElection, new: { name: election.name, startTime: election.startTime, endTime: election.endTime, status: election.status } },
      })

      return election
    })

    revalidatePath("/organisation/elections")
    return { success: true, election: result }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_ACTION]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ELECTION_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: id,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { formData, error: error?.message || "Unknown error" }
        })
      } catch (e) {}
    }
    return { success: false, error: error.message || "Failed to update election. Please try again." }
  }
}

export async function deleteElection(id: string) {
  let adminId = "";
  let orgId = "";
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_DELETED",
      entityType: AuditEntityType.ELECTION,
      entityId: id,
    })
    adminId = access.userId;
    orgId = access.organizationId;
    const { userId, organizationId } = access

    await db.$transaction(async (tx) => {
      const election = await tx.election.findUnique({
        where: { id, organizationId, deletedAt: null },
        select: { name: true, code: true, status: true }
      })

      if (!election) throw new Error("Election not found")

      // C1/C2: Never hard-delete elections — soft-delete only
      // Also block deletion of COMPLETED elections to preserve election integrity
      if (election.status === ElectionStatus.COMPLETED) {
        throw new Error("Completed elections cannot be deleted. Archive them instead.")
      }

      await logAdminAction({
        action: "ELECTION_DELETED",
        entityType: AuditEntityType.ELECTION,
        entityId: id,
        adminId: userId,
        organizationId: organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { name: election.name, code: election.code },
      })

      // Soft delete — sets deletedAt, does not remove the row
      await tx.election.update({
        where: { id, organizationId },
        data: { deletedAt: new Date(), updatedByUserId: userId },
      })
    })

    revalidatePath("/organisation/elections")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ELECTION_ACTION]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ELECTION_DELETED",
          entityType: AuditEntityType.ELECTION,
          entityId: id,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" }
        })
      } catch (e) {}
    }
    return { success: false, error: error.message || "Failed to delete election. Please try again." }
  }
}

export async function toggleElectionStatus(id: string) {
  let adminId = "";
  let orgId = "";
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_STATUS_TOGGLED",
      entityType: AuditEntityType.ELECTION,
      entityId: id,
      adminOnly: false,
    })
    adminId = access.userId;
    orgId = access.organizationId;
    const { userId, organizationId } = access

    const result = await db.$transaction(async (tx) => {
      const election = await tx.election.findUnique({
        where: { id, organizationId, deletedAt: null },
        select: { status: true, name: true, startTime: true, endTime: true }
      })

      if (!election) throw new Error("Election not found")

      if (election.status !== ElectionStatus.ACTIVE && election.status !== ElectionStatus.PAUSED) {
        throw new Error("Only active or paused elections can be toggled")
      }

      const calculated = getCalculatedElectionStatus(election.startTime, election.endTime)
      if (calculated === ElectionStatus.COMPLETED) {
        throw new Error("This election has already ended and cannot be toggled")
      }

      const newStatus = election.status === ElectionStatus.ACTIVE ? ElectionStatus.PAUSED : ElectionStatus.ACTIVE

      // C2: Verify the transition is valid before applying it
      assertValidTransition(election.status, newStatus)

      const updated = await tx.election.update({
        where: { id, organizationId },
        data: {
          status: newStatus,
          updatedByUserId: userId
        }
      })

      await logAdminAction({
        action: newStatus === ElectionStatus.PAUSED ? "ELECTION_PAUSED" : "ELECTION_RESUMED",
        entityType: AuditEntityType.ELECTION,
        entityId: id,
        adminId: userId,
        organizationId: organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: {
          name: election.name,
          previousStatus: election.status,
          newStatus
        },
      })

      return updated
    })

    revalidatePath("/organisation/elections")
    revalidatePath(`/organisation/election/${id}`)
    return { success: true, status: result.status }
  } catch (error: any) {
    console.error("[TOGGLE_ELECTION_STATUS_ACTION]", error)
    if (adminId && orgId) {
      try {
        await logAdminAction({
          action: "ELECTION_STATUS_TOGGLED",
          entityType: AuditEntityType.ELECTION,
          entityId: id,
          adminId,
          organizationId: orgId,
          status: AuditStatus.FAILURE,
          metadata: { error: error?.message || "Unknown error" }
        })
      } catch (e) {}
    }
    return { success: false, error: error.message || "Failed to update election status" }
  }
}

export async function logElectionCodeCopy(electionId: string) {
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_CODE_COPIED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    const { userId, organizationId } = access

    await logAdminAction({
      action: "ELECTION_CODE_COPIED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminId: userId,
      organizationId: organizationId,
      status: AuditStatus.INFO,
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ELECTION_CODE_COPY]", error)
    return { success: false }
  }
}

export async function updateElectionSettings(electionId: string, data: any) {
  try {
    const access = await requireOrgActionContext({
      action: "ELECTION_SETTINGS_UPDATED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
    })
    
    const result = await db.electionSettings.update({
      where: { electionId },
      data: {
        allowOnlineVoting: data.allowOnlineVoting,
        authorizeVoters: data.authorizeVoters,
        showCandidateProfiles: data.showCandidateProfiles,
        showCandidateSymbols: data.showCandidateSymbols,
        shuffleCandidates: data.shuffleCandidates,
        allowMultipleVotes: data.allowMultipleVotes,
        allowNota: data.allowNota,
        showSummary: data.showSummary,
        quickElection: data.quickElection,
        lockResult: data.lockResult,
        maxVotesPerUser: data.maxVotesPerUser,
        updatedByUserId: access.userId
      }
    })
    
    await logAdminAction({
      action: "ELECTION_SETTINGS_UPDATED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminId: access.userId,
      organizationId: access.organizationId,
      status: AuditStatus.INFO,
      description: "Updated election settings",
      metadata: data
    })

    revalidatePath(`/organisation/election/${electionId}`)
    return { success: true, settings: result }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_SETTINGS]", error)
    try {
      const session = await auth.api.getSession({ headers: await headers() })
      if (session?.user?.id) {
        await logAdminAction({
          action: "ELECTION_SETTINGS_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: session.user.id,
          organizationId: session.session.activeOrganizationId,
          status: AuditStatus.FAILURE,
          description: `Failed to update election settings: ${error.message || String(error)}`,
          metadata: { data }
        })
      }
    } catch {}
    return { success: false, error: error.message || "Failed to update settings" }
  }
}
