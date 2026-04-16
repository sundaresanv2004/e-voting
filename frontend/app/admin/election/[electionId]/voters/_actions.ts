"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { VoterSchema, VoterFormValues } from "@/lib/schemas/voter"
import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"

/**
 * Authorization helper to ensure user is permitted to manage voters
 */
async function getAuthorizedUser(electionId: string) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true }
  })

  if (!user || !user.organizationId || (user.role !== UserRole.ORG_ADMIN && user.role !== UserRole.STAFF)) {
    throw new Error("Only admins and staff can manage voters")
  }

  // Verify election belongs to the organization
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: user.organizationId
    }
  })

  if (!election) {
    throw new Error("Election not found or unauthorized")
  }

  return { userId: session.user.id, organizationId: user.organizationId }
}

/**
 * Generates a unique, non-repeating ID for a voter in a specific election
 */
async function generateSafeUniqueId(electionId: string): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let isUnique = false
  let code = ""
  
  while (!isUnique) {
    let raw = ""
    for (let i = 0; i < 8; i++) {
      raw += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    code = raw.slice(0, 4) + "-" + raw.slice(4)
    
    // Check DB for collision
    const existing = await db.voter.findUnique({
      where: {
        electionId_uniqueId: {
          electionId,
          uniqueId: code
        }
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

export async function createVoter(electionId: string, values: VoterFormValues) {
  try {
    const { userId, organizationId } = await getAuthorizedUser(electionId)
    
    const validatedFields = VoterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    const { name, uniqueId: providedId, image, additionalDetails } = validatedFields.data

    // Generate ID if missing
    const uniqueId = (providedId && providedId.trim() !== "") 
      ? providedId 
      : await generateSafeUniqueId(electionId)

    // Check if voter already exists for this election
    const existingVoter = await db.voter.findUnique({
      where: {
        electionId_uniqueId: {
          electionId,
          uniqueId
        }
      }
    })

    if (existingVoter) {
      return { error: "Voter with this Unique ID already exists in this election" }
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

    // Generate ID if missing
    const uniqueId = (providedId && providedId.trim() !== "") 
      ? providedId 
      : await generateSafeUniqueId(electionId)

    // Check if another voter has the same uniqueId in this election
    const existingVoter = await db.voter.findFirst({
      where: {
        electionId,
        uniqueId: String(uniqueId),
        NOT: { id: voterId }
      }
    })

    if (existingVoter) {
      return { error: "Another voter with this Unique ID already exists" }
    }


    await db.$transaction(async (tx) => {
      const oldVoter = await tx.voter.findUnique({
        where: { id: voterId },
        select: { name: true, uniqueId: true }
      })

      await tx.voter.update({
        where: { id: voterId },
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
      where: { id: voterId },
      include: { ballot: true }
    })

    if (voter?.ballot) {
      return { error: "Cannot delete a voter who has already cast a ballot" }
    }

    await db.$transaction(async (tx) => {
      const voterData = await tx.voter.findUnique({
        where: { id: voterId },
        select: { name: true, uniqueId: true }
      })

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
        where: { id: voterId }
      })
    })

    revalidatePath(`/admin/election/${electionId}/voters`)
    return { success: "Voter deleted successfully" }
  } catch (error: any) {
    console.error("DELETE_VOTER_ERROR:", error)
    return { error: error.message || "Something went wrong" }
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

    // Find existing voters in this election with these IDs
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
    const data = []
    const generatedInBatch = new Set<string>()

    for (const v of voterData) {
      const { unique_id, name, ...rest } = v
      
      let finalUniqueId = (unique_id && String(unique_id).trim() !== "") 
        ? String(unique_id) 
        : null

      // If missing, generate one that isn't in DB AND isn't in this batch
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

