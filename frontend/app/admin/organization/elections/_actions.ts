"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ElectionStatus, UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { ElectionSchema } from "@/lib/schemas/election"
import { getCalculatedElectionStatus } from "@/lib/utils/election"

function generateCode(orgName: string = "EV") {
  // Sanitize the organization name to create a meaningful prefix
  // Remove special characters, handle multi-word names
  const sanitized = orgName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const prefix = sanitized.length >= 3 ? sanitized.substring(0, 4) : "EV"
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix}-${result}`
}

export async function createElection(formData: {
  name: string
  startTime: Date
  endTime: Date
}) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId
  const userRole = session?.user?.role

  if (!userId || !orgId || userRole !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized - Only Organization Admins can create elections")
  }

  const validatedFields = ElectionSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { 
      success: false, 
      error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid election details" 
    }
  }

  const { name, startTime, endTime } = validatedFields.data

  try {
    // 1. Fetch organization details to get a meaningful name for the code prefix
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    })

    const result = await db.$transaction(async (tx) => {
      // 2. Create the Election
      const election = await tx.election.create({
        data: {
          name: formData.name,
          code: generateCode(organization?.name),
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: getCalculatedElectionStatus(formData.startTime, formData.endTime),
          organizationId: orgId,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      // 3. Create default ElectionSettings
      await tx.electionSettings.create({
        data: {
          electionId: election.id,
          requireSystemAuth: true,
          allSystemsAllowed: true,
          createdByUserId: userId,
          updatedByUserId: userId,
        },
      })

      // 4. Log the creation
      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_CREATED",
          entityType: AuditEntityType.ELECTION,
          entityId: election.id,
          adminId: userId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { name: election.name, startTime: election.startTime, endTime: election.endTime, code: election.code },
        }
      })

      return election
    })

    revalidatePath("/admin/organization/elections")
    return { success: true, election: result }
  } catch (error: any) {
    console.error("[CREATE_ELECTION_ACTION]", error)
    return { success: false, error: "Failed to create election. Please try again." }
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
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId
  const userRole = session?.user?.role

  if (!userId || !orgId || userRole !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized - Only Organization Admins can update elections")
  }

  const validatedFields = ElectionSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid election details" 
    }
  }

  const { name, startTime, endTime } = validatedFields.data

  try {
    const result = await db.$transaction(async (tx) => {
      const oldElection = await tx.election.findUnique({
        where: { id, organizationId: orgId },
        select: { name: true, startTime: true, endTime: true, status: true },
      })

      if (!oldElection) {
        throw new Error("Election not found")
      }

      const election = await tx.election.update({
        where: { 
          id,
          organizationId: orgId 
        },
        data: {
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: getCalculatedElectionStatus(formData.startTime, formData.endTime),
          updatedByUserId: userId,
        },
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: election.id,
          adminId: userId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { old: oldElection, new: { name: election.name, startTime: election.startTime, endTime: election.endTime, status: election.status } },
        }
      })

      return election
    })

    revalidatePath("/admin/organization/elections")
    return { success: true, election: result }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_ACTION]", error)
    return { success: false, error: "Failed to update election. Please try again." }
  }
}

export async function deleteElection(id: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId
  const userRole = session?.user?.role

  if (!orgId || userRole !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized - Only Organization Admins can delete elections")
  }

  try {
    await db.$transaction(async (tx) => {
      const election = await tx.election.findUnique({
        where: { id, organizationId: orgId },
        select: { name: true, code: true }
      })

      if (!election) throw new Error("Election not found")

      await tx.election.delete({
        where: { 
          id,
          organizationId: orgId 
        },
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_DELETED",
          entityType: AuditEntityType.ELECTION,
          entityId: id,
          adminId: session?.user?.id!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { name: election.name, code: election.code },
        }
      })
    })

    revalidatePath("/admin/organization/elections")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ELECTION_ACTION]", error)
    return { success: false, error: "Failed to delete election. Please try again." }
  }
}
