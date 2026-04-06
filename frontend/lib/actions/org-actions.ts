"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { OrganizationType, UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { OrganizationFormValues } from "@/lib/schemas/org"

export async function createOrganization(values: OrganizationFormValues) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const { name, type } = values

  if (!name || !type) {
    throw new Error("Missing required fields")
  }

  const prefix = name
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join("")
    .replace(/[^A-Z]/g, '')

  let code: string = ""
  let isUnique = false

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
    const result = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name,
          type,
          code,
          createdByUserId: session.user.id!,
          ownerId: session.user.id!,
          updatedByUserId: session.user.id!,
        },
      })

      await tx.organizationSettings.create({
        data: {
          organizationId: organization.id,
          createdByUserId: session.user.id!,
          updatedByUserId: session.user.id!,
        },
      })

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          role: UserRole.ORG_ADMIN,
          organizationId: organization.id,
        },
      })

      await tx.auditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: "Organization",
          entityId: organization.id,
          userId: session.user.id!,
          metadata: { name, type, code },
        }
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
