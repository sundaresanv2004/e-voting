"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { CandidateSchema, type CandidateFormValues } from "@/lib/schemas/candidate"
import { requireElectionAccess } from "@/lib/authz"

export async function createCandidate(electionId: string, values: CandidateFormValues) {
  const session = await auth()
  try {
    const access = await requireElectionAccess(session?.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
    ])

    const validatedFields = CandidateSchema.safeParse(values)
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors }
    }

    const { name, electionRoleId, profileImage, symbolImage } = validatedFields.data

    // Verify election belongs to organization
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId: access.organizationId }
    })
    if (!election) return { success: false, error: "Election not found" }

    // Verify role belongs to this election
    const role = await db.electionRole.findFirst({
      where: { id: electionRoleId, electionId }
    })
    if (!role) return { success: false, error: "Invalid election role specified" }

    const candidate = await db.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: {
          electionRoleId,
          name,
          profileImage: profileImage || null,
          symbolImage: symbolImage || null,
          createdByUserId: access.userId,
          updatedByUserId: access.userId,
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "CANDIDATE_ADDED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { name, electionRoleId, candidateId: candidate.id },
        }
      })

      return candidate
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true, candidate }
  } catch (error: any) {
    console.error("[CREATE_CANDIDATE]", error)
    return { success: false, error: "Failed to create candidate" }
  }
}

export async function updateCandidate(candidateId: string, electionId: string, values: CandidateFormValues) {
  const session = await auth()
  try {
    const access = await requireElectionAccess(session?.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
    ])

    const validatedFields = CandidateSchema.safeParse(values)
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors }
    }

    const { name, electionRoleId, profileImage, symbolImage } = validatedFields.data

    // Verify candidate belongs to organization through election
    const candidate = await db.candidate.findFirst({
      where: { 
        id: candidateId,
        role: { election: { organizationId: access.organizationId } }
      }
    })

    if (!candidate) return { success: false, error: "Candidate not found" }

    // Verify role belongs to this election
    const role = await db.electionRole.findFirst({
      where: { id: electionRoleId, electionId }
    })
    if (!role) return { success: false, error: "Invalid election role specified" }

    const updatedCandidate = await db.$transaction(async (tx) => {
      const oldCandidate = await tx.candidate.findUnique({
        where: { id: candidateId },
        select: { name: true, electionRoleId: true, profileImage: true, symbolImage: true }
      })

      const candidateData = await tx.candidate.update({
        where: { id: candidateId },
        data: {
          name,
          electionRoleId,
          profileImage: profileImage || null,
          symbolImage: symbolImage || null,
          updatedByUserId: access.userId,
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "CANDIDATE_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { 
            candidateId,
            before: oldCandidate, 
            after: { name, electionRoleId, profileImage, symbolImage } 
          }
        }
      })

      return candidateData
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true, candidate: updatedCandidate }
  } catch (error: any) {
    console.error("[UPDATE_CANDIDATE]", error)
    return { success: false, error: "Failed to update candidate" }
  }
}

export async function deleteCandidate(candidateId: string, electionId: string) {
  const session = await auth()
  try {
    const access = await requireElectionAccess(session?.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
    ])

    // Verify candidate belongs to organization through election
    const candidate = await db.candidate.findFirst({
      where: { 
        id: candidateId,
        role: { election: { organizationId: access.organizationId } }
      }
    })

    if (!candidate) return { success: false, error: "Candidate not found" }

    await db.$transaction(async (tx) => {
      const candidateData = await tx.candidate.findUnique({
        where: { id: candidateId },
        select: { name: true, electionRoleId: true }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "CANDIDATE_REMOVED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { candidateId, name: candidateData?.name, electionRoleId: candidateData?.electionRoleId },
        }
      })

      await tx.candidate.delete({
        where: { id: candidateId }
      })
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_CANDIDATE]", error)
    return { success: false, error: "Failed to delete candidate" }
  }
}
