"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createCandidate(electionId: string, data: { 
  name: string
  electionRoleId: string
  profileImage?: string
  symbolImage?: string
}) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify election belongs to organization
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId: session.user.organizationId }
    })
    if (!election) throw new Error("Election not found")

    // Verify role belongs to this election
    const role = await db.electionRole.findFirst({
      where: { id: data.electionRoleId, electionId }
    })
    if (!role) throw new Error("Invalid election role specified")

    const candidate = await db.candidate.create({
      data: {
        electionId,
        electionRoleId: data.electionRoleId,
        name: data.name,
        profileImage: data.profileImage || null,
        symbolImage: data.symbolImage || null,
        createdByUserId: session.user.id!,
        updatedByUserId: session.user.id!,
      }
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true, candidate }
  } catch (error: any) {
    console.error("[CREATE_CANDIDATE]", error)
    return { success: false, error: error.message || "Failed to create candidate" }
  }
}

export async function updateCandidate(candidateId: string, electionId: string, data: { 
  name: string
  electionRoleId: string
  profileImage?: string
  symbolImage?: string
}) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify candidate belongs to organization through election
    const candidate = await db.candidate.findFirst({
      where: { 
        id: candidateId,
        election: { organizationId: session.user.organizationId }
      }
    })
    if (!candidate) throw new Error("Candidate not found")

    // Verify role belongs to this election
    const role = await db.electionRole.findFirst({
      where: { id: data.electionRoleId, electionId }
    })
    if (!role) throw new Error("Invalid election role specified")

    const updatedCandidate = await db.candidate.update({
      where: { id: candidateId },
      data: {
        name: data.name,
        electionRoleId: data.electionRoleId,
        profileImage: data.profileImage || null,
        symbolImage: data.symbolImage || null,
        updatedByUserId: session.user.id!,
      }
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true, candidate: updatedCandidate }
  } catch (error: any) {
    console.error("[UPDATE_CANDIDATE]", error)
    return { success: false, error: error.message || "Failed to update candidate" }
  }
}

export async function deleteCandidate(candidateId: string, electionId: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify candidate belongs to organization through election
    const candidate = await db.candidate.findFirst({
      where: { 
        id: candidateId,
        election: { organizationId: session.user.organizationId }
      }
    })
    if (!candidate) throw new Error("Candidate not found")

    await db.candidate.delete({
      where: { id: candidateId }
    })

    revalidatePath(`/admin/election/${electionId}/candidates`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_CANDIDATE]", error)
    return { success: false, error: error.message || "Failed to delete candidate" }
  }
}
