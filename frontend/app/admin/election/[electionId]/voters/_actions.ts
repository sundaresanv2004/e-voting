"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { VoterSchema, VoterFormValues } from "@/lib/schemas/voter"
import { UserRole } from "@prisma/client"

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

export async function createVoter(electionId: string, values: VoterFormValues) {
  try {
    const { organizationId } = await getAuthorizedUser(electionId)
    
    const validatedFields = VoterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    const { name, uniqueId, dob, image, additionalDetails } = validatedFields.data

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

    await db.voter.create({
      data: {
        electionId,
        name,
        uniqueId,
        dob,
        image,
        additionalDetails: additionalDetails || {}
      }
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
    await getAuthorizedUser(electionId)

    const validatedFields = VoterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Invalid fields" }
    }

    const { name, uniqueId, dob, image, additionalDetails } = validatedFields.data

    // Check if another voter has the same uniqueId in this election
    const existingVoter = await db.voter.findFirst({
      where: {
        electionId,
        uniqueId,
        NOT: { id: voterId }
      }
    })

    if (existingVoter) {
      return { error: "Another voter with this Unique ID already exists" }
    }

    await db.voter.update({
      where: { id: voterId },
      data: {
        name,
        uniqueId,
        dob,
        image,
        additionalDetails: additionalDetails || {}
      }
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
    await getAuthorizedUser(electionId)

    // Check if voter has already cast a ballot
    const voter = await db.voter.findUnique({
      where: { id: voterId },
      include: { ballot: true }
    })

    if (voter?.ballot) {
      return { error: "Cannot delete a voter who has already cast a ballot" }
    }

    await db.voter.delete({
      where: { id: voterId }
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

    const uniqueIds = voterData.map(v => String(v.unique_id))

    // Find existing voters in this election with these IDs
    const existingVoters = await db.voter.findMany({
      where: {
        electionId,
        uniqueId: { in: uniqueIds }
      },
      select: {
        uniqueId: true,
        name: true
      }
    })

    const existingIdSet = new Set(existingVoters.map(v => v.uniqueId))
    
    const duplicates = voterData.filter(v => existingIdSet.has(String(v.unique_id)))
    const clean = voterData.filter(v => !existingIdSet.has(String(v.unique_id)))

    return {
      success: true,
      total: voterData.length,
      cleanCount: clean.length,
      duplicateCount: duplicates.length,
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
    await getAuthorizedUser(electionId)

    // Prepare data for Prisma createMany
    const data = voterData.map(v => {
      // Extract known fields, put rest in additionalDetails
      const { unique_id, name, dob, ...rest } = v
      
      let parsedDob = null
      if (dob) {
        const d = new Date(dob)
        if (!isNaN(d.getTime())) {
          parsedDob = d
        }
      }

      return {
        electionId,
        uniqueId: String(unique_id),
        name: String(name),
        dob: parsedDob,
        additionalDetails: rest || {}
      }
    })

    const result = await db.voter.createMany({
      data,
      skipDuplicates: true // Safety measure
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

