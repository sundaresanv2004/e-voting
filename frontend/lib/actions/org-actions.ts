"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { UserRole, AuditStatus, AuditEntityType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { sendOrgCreatedEmail } from "@/lib/mail"
import { randomBytes } from "crypto"

import { OrganizationFormValues, OrganizationSchema } from "@/lib/schemas/org"
import { requireVerifiedSetupUser } from "@/lib/authz"

const ORG_SETUP_INELIGIBLE = "ORG_SETUP_INELIGIBLE"

function generateCodeSuffix(length: number = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(length)

  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
}

export async function createOrganization(values: OrganizationFormValues) {
  const session = await auth()
  const user = await requireVerifiedSetupUser(session?.user)

  if (user.organizationId) {
    return {
      success: false,
      error: "Your account is already linked to an organization.",
    }
  }

  const validatedFields = OrganizationSchema.safeParse(values)
  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid organization details",
    }
  }

  const { name, type } = validatedFields.data

  const prefix = name
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join("")
    .replace(/[^A-Z]/g, '')

  let code: string = ""
  let isUnique = false

  while (!isUnique) {
    const randomSuffix = generateCodeSuffix()
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
          createdByUserId: user.userId,
          ownerId: user.userId,
          updatedByUserId: user.userId,
        },
      })

      await tx.organizationSettings.create({
        data: {
          organizationId: organization.id,
          createdByUserId: user.userId,
          updatedByUserId: user.userId,
        },
      })

      const userUpdate = await tx.user.updateMany({
        where: {
          id: user.userId,
          isActive: true,
          emailVerified: { not: null },
          organizationId: null,
        },
        data: {
          role: UserRole.ORG_ADMIN,
          organizationId: organization.id,
        },
      })

      if (userUpdate.count !== 1) {
        throw new Error(ORG_SETUP_INELIGIBLE)
      }

      const headerList = await headers()
      const ip = headerList.get("x-forwarded-for") || "unknown"
      const userAgent = headerList.get("user-agent") || "unknown"

      await tx.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: organization.id,
          adminId: user.userId,
          organizationId: organization.id,
          description: `Created organization: ${name}`,
          status: AuditStatus.SUCCESS,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { name, type, code },
        }
      })

      return organization
    })

    await sendOrgCreatedEmail(
      user.email,
      user.name || "User",
      name,
      code
    )

    revalidatePath("/")
    revalidatePath("/admin/organization")

    return { success: true, data: result }
  } catch (error: unknown) {
    console.error("Failed to create organization:", error)
    if (error instanceof Error && error.message === ORG_SETUP_INELIGIBLE) {
      return {
        success: false,
        error: "Your account is no longer eligible to create an organization. Please refresh and try again.",
      }
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { success: false, error: "Organization code already exists" }
    }
    return { success: false, error: "Failed to create organization" }
  }
}
