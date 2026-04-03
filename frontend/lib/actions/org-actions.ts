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

  // Generate a professional organization code
  // Format: [INITIALS]-[6 RANDOM CHARACTERS] (e.g., VV-A1B2C3)
  const prefix = name
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join("")
    .replace(/[^A-Z]/g, '') // Keep only letters
  
  let code: string = ""
  let isUnique = false

  // Guarantee uniqueness (highly likely on first try, but safely handles collisions)
  while (!isUnique) {
    const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
    
    code = prefix ? `${prefix}-${randomSuffix}` : randomSuffix
    
    const existing = await db.organization.findUnique({
        where: { code }
    })
    
    if (!existing) isUnique = true
  }

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
