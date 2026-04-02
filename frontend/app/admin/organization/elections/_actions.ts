"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ElectionStatus } from "@prisma/client"

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `EV-${result}`
}

export async function createElection(formData: {
  name: string
  startTime: Date
  endTime: Date
}) {
  const session = await auth()

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized - Organization not found")
  }

  try {
    const election = await db.election.create({
      data: {
        name: formData.name,
        code: generateCode(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: ElectionStatus.UPCOMING,
        organizationId: session.user.organizationId,
        createdByUserId: session.user.id!,
      },
    })

    revalidatePath("/admin/organization/elections")
    return { success: true, election }
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

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized - Organization not found")
  }

  try {
    const election = await db.election.update({
      where: { 
        id,
        organizationId: session.user.organizationId 
      },
      data: {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    })

    revalidatePath("/admin/organization/elections")
    return { success: true, election }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_ACTION]", error)
    return { success: false, error: "Failed to update election. Please try again." }
  }
}

export async function deleteElection(id: string) {
  const session = await auth()

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized - Organization not found")
  }

  try {
    await db.election.delete({
      where: { 
        id,
        organizationId: session.user.organizationId 
      },
    })

    revalidatePath("/admin/organization/elections")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ELECTION_ACTION]", error)
    return { success: false, error: "Failed to delete election. Please try again." }
  }
}
