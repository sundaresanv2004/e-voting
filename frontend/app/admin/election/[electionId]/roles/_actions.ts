"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createRole(electionId: string, data: { name: string; order: number; systemIds: string[] }) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify election belongs to organization
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId: session.user.organizationId }
    })
    if (!election) throw new Error("Election not found")

    if (data.order < 1) {
      throw new Error("Priority order must be 1 or greater")
    }

    // Check if order is already taken in this election
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order: data.order 
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${data.order} is already taken by "${existingOrder.name}"`)
    }

    const role = await db.electionRole.create({
      data: {
        electionId,
        name: data.name,
        order: data.order,
        allowedSystems: {
          connect: data.systemIds.map(id => ({ id }))
        }
      }
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true, role }
  } catch (error: any) {
    console.error("[CREATE_ROLE]", error)
    return { success: false, error: error.message || "Failed to create role" }
  }
}

export async function updateRole(roleId: string, electionId: string, data: { name: string; order: number; systemIds: string[] }) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify role belongs to organization through election
    const role = await db.electionRole.findFirst({
      where: { 
        id: roleId,
        election: { organizationId: session.user.organizationId }
      }
    })
    if (!role) throw new Error("Role not found")

    if (data.order < 1) {
      throw new Error("Priority order must be 1 or greater")
    }

    // Check if order is taken by another role
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order: data.order,
        NOT: { id: roleId }
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${data.order} is already taken by "${existingOrder.name}"`)
    }

    const updatedRole = await db.electionRole.update({
      where: { id: roleId },
      data: {
        name: data.name,
        order: data.order,
        allowedSystems: {
          set: data.systemIds.map(id => ({ id }))
        }
      }
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true, role: updatedRole }
  } catch (error: any) {
    console.error("[UPDATE_ROLE]", error)
    return { success: false, error: error.message || "Failed to update role" }
  }
}

export async function deleteRole(roleId: string, electionId: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    // Verify role belongs to organization
    const role = await db.electionRole.findFirst({
      where: { 
        id: roleId,
        election: { organizationId: session.user.organizationId }
      }
    })
    if (!role) throw new Error("Role not found")

    await db.electionRole.delete({
      where: { id: roleId }
    })

    revalidatePath(`/admin/election/${electionId}/roles`)
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ROLE]", error)
    return { success: false, error: error.message || "Failed to delete role" }
  }
}
