"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, OrganizationType } from "@prisma/client"

export async function getOrganizationData() {
  const session = await auth()
  const orgId = session?.user?.organizationId as string
  if (!orgId) return null

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      settings: true
    }
  })

  // If settings don't exist for some reason, create them
  if (organization && !organization.settings) {
    const adminId = session?.user?.id as string
    const settings = await db.organizationSettings.create({
      data: {
        organizationId: orgId,
        createdByUserId: adminId,
        updatedByUserId: adminId
      }
    })
    organization.settings = settings
  }

  return organization
}

export async function updateOrganizationAction(
  name: string,
  type: OrganizationType,
  logo?: string
) {
  const session = await auth()
  const adminId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    await db.organization.update({
      where: { id: orgId },
      data: {
        name,
        type,
        logo: logo || null,
        updatedByUserId: adminId!
      }
    })

    revalidatePath("/admin/organization/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORGANIZATION_ACTION]", error)
    return { success: false, error: "Failed to update organization profile" }
  }
}

export async function updateOrganizationSettingsAction(data: {
  allowMachineSelfRegister: boolean
  maxMachines: number | null
  allowResultPublish: boolean
  electionRequiresApproval: boolean
  voterImportEnabled: boolean
}) {
  const session = await auth()
  const adminId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    await db.organizationSettings.update({
      where: { organizationId: orgId },
      data: {
        ...data,
        updatedByUserId: adminId!
      }
    })

    revalidatePath("/admin/organization/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORG_SETTINGS_ACTION]", error)
    return { success: false, error: "Failed to update organization settings" }
  }
}

export async function deleteOrganizationAction() {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    // 1. Manually update all members of the organization to have no organization
    // and reset their role to USER before the organization is deleted.
    // This ensures they don't get stuck in an invalid state.
    await db.$transaction([
      db.user.updateMany({
        where: { organizationId: orgId },
        data: {
          organizationId: null,
          role: UserRole.USER,
          isActive: true
        }
      }),
      // 2. Delete the organization. 
      // Prisma relations with onDelete: Cascade will handle settings, elections, etc.
      db.organization.delete({
        where: { id: orgId }
      })
    ])

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ORGANIZATION_ACTION]", error)
    return { success: false, error: "Failed to delete organization. Please try again later." }
  }
}

