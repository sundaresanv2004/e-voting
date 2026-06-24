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
import { sendEmail } from "@/lib/email"
import ElectionCreatedEmail from "@/emails/ElectionCreatedEmail"
import ResultsDownloadedEmail from "@/emails/ResultsDownloadedEmail"

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
  [ElectionStatus.UPCOMING]: [ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
  [ElectionStatus.ACTIVE]: [ElectionStatus.PAUSED, ElectionStatus.COMPLETED, ElectionStatus.CANCELLED],
  [ElectionStatus.PAUSED]: [ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
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

    // --- Send Emails ---
    const owner = await db.user.findUnique({
      where: { id: organization.ownerId || "" },
      select: { email: true, name: true, id: true }
    })

    const creator = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, id: true }
    })

    if (owner && owner.email) {
      await sendEmail({
        to: owner.email,
        subject: `New Election Created: ${result.name}`,
        react: <ElectionCreatedEmail
          userName={owner.name}
          electionName={result.name}
          electionCode={result.code}
          orgName={organization.name}
          electionId={result.id}
          startDate={result.startTime.toLocaleDateString("en-US", { dateStyle: "medium" })}
          endDate={result.endTime.toLocaleDateString("en-US", { dateStyle: "medium" })}
          createdBy={creator?.name || "an administrator"}
        />,
      })
    }

    if (creator && creator.id !== owner?.id && creator.email) {
      await sendEmail({
        to: creator.email,
        subject: `You Created an Election: ${result.name}`,
        react: <ElectionCreatedEmail
          userName={creator.name}
          electionName={result.name}
          electionCode={result.code}
          orgName={organization.name}
          electionId={result.id}
          startDate={result.startTime.toLocaleDateString("en-US", { dateStyle: "medium" })}
          endDate={result.endTime.toLocaleDateString("en-US", { dateStyle: "medium" })}
          createdBy="you"
        />,
      })
    }
    // -------------------

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
      } catch (e) { }
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
      } catch (e) { }
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
      } catch (e) { }
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
      } catch (e) { }
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
      adminOnly: false,
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
    } catch { }
    return { success: false, error: error.message || "Failed to update settings" }
  }
}

// ─── Sync Election Status Based on Time ──────────────────────────────────────
//
// Safety rules (production-safe):
//   1. Never touches PAUSED    — manually set, must remain until admin acts.
//   2. Never touches CANCELLED — terminal state, immutable.
//   3. Never touches COMPLETED — terminal state, immutable.
//   4. Only UPCOMING → ACTIVE and ACTIVE → COMPLETED are auto-applied.
//   5. Skips the DB write entirely when status already matches — zero writes for healthy rows.
//   6. Never throws — always swallows errors so callers can fire-and-forget.

/**
 * Syncs a single election's status against its startTime / endTime.
 * Safe to call without awaiting from any server component.
 */
export async function syncElectionStatus(
  electionId: string,
  organizationId: string
): Promise<void> {
  try {
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId, deletedAt: null },
      select: { status: true, startTime: true, endTime: true },
    })

    if (!election) return

    // Skip manual and terminal states — never auto-override these.
    const SKIP_STATUSES: ElectionStatus[] = [
      ElectionStatus.PAUSED,
      ElectionStatus.CANCELLED,
      ElectionStatus.COMPLETED,
    ]
    if (SKIP_STATUSES.includes(election.status)) return

    const calculated = getCalculatedElectionStatus(
      election.startTime,
      election.endTime
    )

    // Nothing to do — DB is already correct.
    if (calculated === election.status) return

    await db.election.update({
      where: { id: electionId, organizationId },
      data: { status: calculated },
    })
    // No revalidatePath here — cannot call it during render. The pages that
    // await this function are force-dynamic and re-fetch from DB immediately
    // after, so the corrected status is always visible on the current request.
  } catch (err) {
    // Non-fatal — log and move on. A failed sync must never crash a page load.
    console.error("[SYNC_ELECTION_STATUS]", electionId, err)
  }
}

/**
 * Bulk-syncs all elections for an org.
 * Called from the elections list page so every row is corrected in one pass.
 */
export async function syncAllElectionStatuses(
  organizationId: string
): Promise<void> {
  try {
    const now = new Date()

    // UPCOMING → ACTIVE: election has started but DB still says UPCOMING
    await db.election.updateMany({
      where: {
        organizationId,
        deletedAt: null,
        status: ElectionStatus.UPCOMING,
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: ElectionStatus.ACTIVE },
    })

    // ACTIVE → COMPLETED: election has ended but DB still says ACTIVE
    await db.election.updateMany({
      where: {
        organizationId,
        deletedAt: null,
        status: ElectionStatus.ACTIVE,
        endTime: { lte: now },
      },
      data: { status: ElectionStatus.COMPLETED },
    })

    // No revalidatePath here — same reason as syncElectionStatus above.
  } catch (err) {
    console.error("[SYNC_ALL_ELECTION_STATUSES]", organizationId, err)
  }
}

// ─── Notify Owner: Results Downloaded ────────────────────────────────────────

export async function notifyResultsDownloadAction(
  electionId: string,
  downloadType: string
) {
  try {
    const access = await requireOrgActionContext({
      action: "RESULTS_EXPORTED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminOnly: false,
    })
    const { userId, organizationId, organization } = access

    // Fetch election name
    const election = await db.election.findUnique({
      where: { id: electionId, organizationId, deletedAt: null },
      select: { name: true },
    })
    if (!election) return { success: false }

    // Fetch who performed the download
    const downloader = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    // Fetch org owner
    const owner = await db.user.findUnique({
      where: { id: organization.ownerId || "" },
      select: { name: true, email: true },
    })

    const downloadedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })

    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: `Results Exported: ${election.name}`,
        react: (
          <ResultsDownloadedEmail
            ownerName={owner.name}
            orgName={organization.name}
            electionName={election.name}
            electionId={electionId}
            downloadedBy={downloader?.name || "A member"}
            downloadType={downloadType}
            downloadedAt={downloadedAt}
          />
        ),
      })
    }

    await logAdminAction({
      action: "RESULTS_EXPORTED",
      entityType: AuditEntityType.ELECTION,
      entityId: electionId,
      adminId: userId,
      organizationId,
      status: AuditStatus.INFO,
      description: `Results exported as ${downloadType}`,
      metadata: { downloadType, downloadedAt },
    })

    return { success: true }
  } catch (error: any) {
    console.error("[NOTIFY_RESULTS_DOWNLOAD]", error)
    return { success: false }
  }
}
