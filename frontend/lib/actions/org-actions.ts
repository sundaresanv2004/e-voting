"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { OrganizationType, UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createOrganization(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const type = formData.get("type") as OrganizationType

  if (!name || !type) {
    throw new Error("Missing required fields")
  }

  // Generate a unique 6-character code based on the org name + random string
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
  const code = `${prefix.padEnd(3, 'X')}-${randomStr}`

  try {
    // Create organization and update user in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create the Organization
      const organization = await tx.organization.create({
        data: {
          name,
          type,
          code,
          createdByUserId: session.user.id!,
          updatedByUserId: session.user.id!,
        },
      })

      // 2. Create default OrganizationSettings
      await tx.organizationSettings.create({
        data: {
          organizationId: organization.id,
          createdByUserId: session.user.id!,
          updatedByUserId: session.user.id!,
        },
      })

      // 3. Update the User role and organizationId
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          role: UserRole.ORG_ADMIN,
          organizationId: organization.id,
        },
      })

      return organization
    })

    revalidatePath("/")
    revalidatePath("/admin/organization")

    return { success: true, data: result }
  } catch (error: any) {
    console.error("Failed to create organization:", error)
    if (error.code === 'P2002') {
      return { success: false, error: "Organization code already exists" }
    }
    return { success: false, error: "Failed to create organization" }
  }
}
