"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { RoleSchema, type RoleFormValues } from "@/lib/schemas/role"

export async function createRole(electionId: string, data: RoleFormValues) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    const validatedFields = RoleSchema.safeParse(data)
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid role details" 
      }
    }

    const { name, order, allSystems, systemIds } = validatedFields.data

    // Verify election belongs to organization
    const election = await db.election.findFirst({
      where: { id: electionId, organizationId: session.user.organizationId }
    })
    if (!election) throw new Error("Election not found")

    // Check if order is already taken in this election
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${order} is already taken by "${existingOrder.name}"`)
    }

    // Prepare system relations
    const finalSystemIds = allSystems ? [] : systemIds

    // Verify all systemIds belong to the same organization
    if (finalSystemIds.length > 0) {
      const authorizedSystems = await db.authorizedSystem.count({
        where: {
          id: { in: finalSystemIds },
          organizationId: session.user.organizationId
        }
      })
      if (authorizedSystems !== finalSystemIds.length) {
        throw new Error("One or more selected systems are invalid")
      }
    }

    const role = await db.electionRole.create({
      data: {
        electionId,
        name,
        order,
        createdByUserId: session.user.id,
        updatedByUserId: session.user.id,
        allowedSystems: {
          connect: finalSystemIds.map(id => ({ id }))
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

export async function updateRole(roleId: string, electionId: string, data: RoleFormValues) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.organizationId) throw new Error("Unauthorized")

  try {
    const validatedFields = RoleSchema.safeParse(data)
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid role details" 
      }
    }

    const { name, order, allSystems, systemIds } = validatedFields.data

    // Verify role belongs to organization through election
    const role = await db.electionRole.findFirst({
      where: { 
        id: roleId,
        election: { organizationId: session.user.organizationId }
      }
    })
    if (!role) throw new Error("Role not found")

    // Check if order is taken by another role
    const existingOrder = await db.electionRole.findFirst({
      where: { 
        electionId, 
        order,
        NOT: { id: roleId }
      }
    })
    if (existingOrder) {
      throw new Error(`Priority order ${order} is already taken by "${existingOrder.name}"`)
    }

    // Prepare system relations
    const finalSystemIds = allSystems ? [] : systemIds

    // Verify all systemIds belong to the same organization
    if (finalSystemIds.length > 0) {
      const authorizedSystems = await db.authorizedSystem.count({
        where: {
          id: { in: finalSystemIds },
          organizationId: session.user.organizationId
        }
      })
      if (authorizedSystems !== finalSystemIds.length) {
        throw new Error("One or more selected systems are invalid")
      }
    }

    const updatedRole = await db.electionRole.update({
      where: { id: roleId },
      data: {
        name,
        order,
        updatedByUserId: session.user.id,
        allowedSystems: {
          set: finalSystemIds.map(id => ({ id }))
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
