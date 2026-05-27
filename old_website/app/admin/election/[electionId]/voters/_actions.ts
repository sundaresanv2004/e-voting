"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { VoterSchema, VoterFormValues } from "@/lib/schemas/voter"
import { UserRole, AuditEntityType, AuditStatus, Prisma } from "@prisma/client"
import { requireElectionAccess } from "@/lib/authz"
import { randomBytes } from "crypto"

/**
 * Authorization helper to ensure user is permitted to manage voters
 */
async function getAuthorizedUser(electionId: string) {
  const session = await auth()
  const access = await requireElectionAccess(session?.user, electionId, [
    UserRole.ORG_ADMIN,
    UserRole.STAFF,
  ])

  return { userId: access.userId, organizationId: access.organizationId }
}

/**
 * Generates a unique, non-repeating ID for a voter in a specific election
 */
async function generateSafeUniqueId(electionId: string): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let isUnique = false
  let code = ""
  
  while (!isUnique) {
    const bytes = randomBytes(8)
    const raw = Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
    code = raw.slice(0, 4) + "-" + raw.slice(4)
    
    // Check DB for collision within this election only
    const existing = await db.voter.findUnique({
      where: {
        electionId_uniqueId: { electionId, uniqueId: code }
      }
    })
    
    if (!existing) isUnique = true
  }
  
  return code
}

/**
 * Public action to get a unique code (used by the UI button)
 */
export async function getNewUniqueCode(electionId: string) {
  try {
    await getAuthorizedUser(electionId)
    const code = await generateSafeUniqueId(electionId)
    return { code }
  } catch (error: any) {
    return { error: error.message || "Failed to generate code" }
  }
}

export async function logVoterIdAccess(electionId: string, voterId: string, action: "copied") {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)

    const voter = await db.voter.findUnique({
      where: { id: voterId, electionId },
      select: { name: true, uniqueId: true }
    })

    if (!voter) return { error: "Voter not found" }

    await db.adminAuditLog.create({
      data: {
        action: "VOTER_ID_COPIED",
        entityType: AuditEntityType.ELECTION,
        entityId: electionId,
        adminId: userId,
        organizationId: organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { voterId, name: voter.name, uniqueId: voter.uniqueId },
      },
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to log access" }
  }
}

export async function createVoter(electionId: string, values: VoterFormValues) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)
    
    const validatedFields = VoterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    const { name, uniqueId: providedId, image, additionalDetails } = validatedFields.data

    // Generate ID if missing — scoped to this election
    const uniqueId = (providedId && providedId.trim() !== "") 
      ? providedId 
      : await generateSafeUniqueId(electionId)

    // Check uniqueness within this election only
    const existingVoter = await db.voter.findUnique({
      where: {
        electionId_uniqueId: { electionId, uniqueId }
      }
    })

    if (existingVoter) {
      return { error: "This Unique ID is already assigned to another voter in this election" }
    }


    await db.$transaction(async (tx) => {
      await tx.voter.create({
        data: {
          electionId,
          name,
          uniqueId,
          image,
          additionalDetails: additionalDetails || {},
          createdByUserId: userId,
          updatedByUserId: userId
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "VOTER_CREATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: userId,
          organizationId: organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { name, uniqueId }
        }
      })
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { success: "Voter created successfully" }
  } catch (error: any) {
    console.error("CREATE_VOTER_ERROR:", error)
    return { error: error.message || "Something went wrong" }
  }
}

export async function updateVoter(voterId: string, electionId: string, values: VoterFormValues) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)

    const validatedFields = VoterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    const { name, uniqueId: providedId, image, additionalDetails } = validatedFields.data

    // Generate ID if missing — scoped to this election
    const uniqueId = (providedId && providedId.trim() !== "") 
      ? providedId 
      : await generateSafeUniqueId(electionId)

    // Check uniqueness within this election only (excluding self)
    const existingVoter = await db.voter.findFirst({
      where: {
        electionId,
        uniqueId: String(uniqueId),
        NOT: { id: voterId }
      }
    })

    if (existingVoter) {
      return { error: "Another voter with this Unique ID already exists in this election" }
    }


    await db.$transaction(async (tx) => {
      const oldVoter = await tx.voter.findUnique({
        where: { id: voterId, electionId },
        select: { name: true, uniqueId: true }
      })

      if (!oldVoter) {
        throw new Error("Voter not found")
      }

      await tx.voter.update({
        where: { id: voterId, electionId },
        data: {
          name,
          uniqueId,
          image,
          additionalDetails: additionalDetails || {},
          updatedByUserId: userId
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "VOTER_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: userId,
          organizationId: organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { 
            voterId,
            before: oldVoter,
            after: { name, uniqueId }
          }
        }
      })
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { success: "Voter updated successfully" }
  } catch (error: any) {
    console.error("UPDATE_VOTER_ERROR:", error)
    return { error: error.message || "Something went wrong" }
  }
}

export async function deleteVoter(voterId: string, electionId: string) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)

    // Check if voter has already cast a ballot
    const voter = await db.voter.findUnique({
      where: { id: voterId, electionId },
      include: { ballots: true }
    })

    if (!voter) {
      return { error: "Voter not found" }
    }

    if (voter?.ballots && voter.ballots.length > 0) {
      return { error: "Cannot delete a voter who has already cast a ballot" }
    }

    await db.$transaction(async (tx) => {
      const voterData = await tx.voter.findUnique({
        where: { id: voterId, electionId },
        select: { name: true, uniqueId: true }
      })

      if (!voterData) {
        throw new Error("Voter not found")
      }

      await tx.adminAuditLog.create({
        data: {
          action: "VOTER_REMOVED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: userId,
          organizationId: organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { voterId, name: voterData?.name, uniqueId: voterData?.uniqueId }
        }
      })

      await tx.voter.delete({
        where: { id: voterId, electionId }
      })
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { success: "Voter deleted successfully" }
  } catch (error: any) {
    console.error("DELETE_VOTER_ERROR:", error)
    return { error: error.message || "Something went wrong" }
  }
}

export async function resetVoterVote(voterId: string, electionId: string) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)

    // Check if voter has actually cast a ballot
    const voter = await db.voter.findUnique({
      where: { id: voterId, electionId },
      include: { ballots: true }
    })

    if (!voter) {
      return { error: "Voter not found" }
    }

    if (!voter?.ballots || voter.ballots.length === 0) {
      return { error: "This voter has not cast any ballots yet." }
    }

    await db.$transaction(async (tx) => {
      const voterData = await tx.voter.findUnique({
        where: { id: voterId, electionId },
        select: { name: true, uniqueId: true }
      })

      if (!voterData) {
        throw new Error("Voter not found")
      }

      // Log the reset action
      await tx.adminAuditLog.create({
        data: {
          action: "VOTER_VOTE_RESET",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: userId,
          organizationId: organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { 
            voterId, 
            name: voterData?.name, 
            uniqueId: voterData?.uniqueId, 
            ballotCount: voter.ballots.length,
            ballotIds: voter.ballots.map(b => b.id)
          }
        }
      })

      // Delete all ballots for this voter
      await tx.ballot.deleteMany({
        where: { voterId: voterId }
      })
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { success: "Voter's vote has been successfully reset." }
  } catch (error: any) {
    console.error("RESET_VOTER_VOTE_ERROR:", error)
    return { error: error.message || "Something went wrong resetting the vote" }
  }
}

/**
 * Verifies a batch of voter data against the database to identify duplicates
 */
export async function verifyVotersBulk(electionId: string, voterData: any[]) {
  try {
    await getAuthorizedUser(electionId)

    // Filter out voters who already have a unique_id and check them
    const providedIds = voterData
      .filter(v => v.unique_id && String(v.unique_id).trim() !== "")
      .map(v => String(v.unique_id))

    // Find existing voters in this election with these IDs (scoped to this election)
    const existingVoters = providedIds.length > 0 
      ? await db.voter.findMany({
          where: {
            electionId,
            uniqueId: { in: providedIds }
          },
          select: { uniqueId: true }
        })
      : []

    const existingIdSet = new Set(existingVoters.map(v => v.uniqueId))
    
    const duplicates = voterData.filter(v => v.unique_id && existingIdSet.has(String(v.unique_id)))
    const clean = voterData.filter(v => !v.unique_id || !existingIdSet.has(String(v.unique_id)))
    const missingIdCount = voterData.filter(v => !v.unique_id || String(v.unique_id).trim() === "").length

    return {
      success: true,
      total: voterData.length,
      cleanCount: clean.length,
      duplicateCount: duplicates.length,
      missingIdCount,
      duplicates: duplicates.map(d => ({
        uniqueId: String(d.unique_id),
        name: String(d.name)
      }))
    }


  } catch (error: any) {
    console.error("VERIFY_VOTERS_BULK_ERROR:", error)
    return { error: error.message || "Failed to verify data" }
  }
}

/**
 * Bulk imports validated voter data
 */
export async function importVotersBulk(electionId: string, voterData: any[]) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)

    // Prepare data for Prisma createMany
    const data: Prisma.VoterCreateManyInput[] = []
    const generatedInBatch = new Set<string>()

    for (const v of voterData) {
      const { unique_id, name, ...rest } = v
      
      let finalUniqueId = (unique_id && String(unique_id).trim() !== "") 
        ? String(unique_id) 
        : null

      // If missing, generate one that isn't in DB (scoped to election) AND isn't in this batch
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

      data.push({
        electionId,
        uniqueId: finalUniqueId as string,
        name: String(name),
        additionalDetails: rest || {},
        createdByUserId: userId,
        updatedByUserId: userId
      })
    }



    const result = await db.$transaction(async (tx) => {
      const importResult = await tx.voter.createMany({
        data,
        skipDuplicates: true
      })

      await tx.adminAuditLog.create({
        data: {
          action: "VOTERS_BULK_IMPORT",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: userId,
          organizationId: organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { count: importResult.count }
        }
      })

      return importResult
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { 
      success: true, 
      count: result.count,
      message: `Successfully imported ${result.count} voters.`
    }
  } catch (error: any) {
    console.error("IMPORT_VOTERS_BULK_ERROR:", error)
    return { error: error.message || "Bulk import failed" }
  }
}
