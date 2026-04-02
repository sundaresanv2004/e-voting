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
    if (error.code === 'P2002') {
      return { success: false, error: "An election with this code already exists." }
    }
    return { success: false, error: "Failed to create election. Please try again." }
  }
}
