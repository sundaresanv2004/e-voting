"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, AuditStatus, AuditEntityType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { randomBytes } from "crypto"

import { OrganizationFormValues, OrganizationSchema } from "@/lib/schemas/org"

function generateCodeSuffix(length: number = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(length)
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("")
}

function generateSlug(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-")          // Replace spaces with hyphens
        .replace(/-+/g, "-");          // Remove consecutive hyphens
}

export async function createOrganization(values: OrganizationFormValues) {
  const headerList = await headers()
  const session = await auth.api.getSession({
    headers: headerList
  })

  if (!session?.user) {
    return { success: false, error: "Unauthorized" }
  }

  const user = session.user

  // Check if they are already in an organization
  const existingMember = await db.member.findFirst({
    where: { userId: user.id }
  })
  if (existingMember) {
    const ip = headerList.get("x-forwarded-for") || "unknown"
    const userAgent = headerList.get("user-agent") || "unknown"
    try {
      await db.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: AuditEntityType.ORGANIZATION,
          adminId: user.id,
          description: "Attempted to create organization but user is already a member of an organization",
          status: AuditStatus.FAILURE,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { error: "Already member of an organization", name: values.name },
        }
      })
    } catch (e) {
      console.error("Failed to log organization creation failure:", e)
    }

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

  const { name, type, logo } = validatedFields.data

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

  // Generate a temporary slug to satisfy Better Auth (user won't see it)
  const slug = `${generateSlug(name)}-${generateCodeSuffix(4).toLowerCase()}`

  try {
    // 1. Create Organization via Better Auth API
    const orgResult = await auth.api.createOrganization({
      body: {
        name,
        slug,
        type,
        code,
        logo,
        userId: user.id
      } as any // Cast due to extended schema not being instantly inferred
    })

    if (!orgResult) {
      return { success: false, error: "Failed to create organization via Auth" }
    }

    const orgId = orgResult.id;

    // 2. Perform secondary database updates in a transaction
    await db.$transaction(async (tx) => {
      // Create OrganizationSettings
      await tx.organizationSettings.create({
        data: {
          organizationId: orgId,
          createdByUserId: user.id,
          updatedByUserId: user.id,
        },
      })

      // Update User Role to ORG_ADMIN
      await tx.user.updateMany({
        where: {
          id: user.id,
        },
        data: {
          role: UserRole.org_admin,
          authVersion: { increment: 1 },
        },
      })

      // Update Organization metadata to include custom fields if BetterAuth ignored them (fallback)
      await tx.organization.update({
        where: { id: orgId },
        data: {
          code,
          type,
          logo,
          createdByUserId: user.id,
          updatedByUserId: user.id,
          ownerId: user.id
        }
      })

      // Audit Log
      const ip = headerList.get("x-forwarded-for") || "unknown"
      const userAgent = headerList.get("user-agent") || "unknown"

      await tx.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: orgId,
          adminId: user.id,
          organizationId: orgId,
          description: `Created organization: ${name}`,
          status: AuditStatus.SUCCESS,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { name, type, code, logo },
        }
      })
    })

    revalidatePath("/")
    revalidatePath("/organisation")

    return { success: true, data: orgResult }
  } catch (error: unknown) {
    console.error("Failed to create organization:", error)
    const ip = headerList.get("x-forwarded-for") || "unknown"
    const userAgent = headerList.get("user-agent") || "unknown"
    try {
      await db.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: AuditEntityType.ORGANIZATION,
          adminId: user.id,
          description: `Failed to create organization: ${values.name}`,
          status: AuditStatus.FAILURE,
          ipAddress: ip,
          userAgent: userAgent,
          metadata: { 
            name: values.name, 
            type: values.type, 
            error: error instanceof Error ? error.message : String(error) 
          },
        }
      })
    } catch (e) {
      console.error("Failed to log organization creation failure:", e)
    }
    if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
      return { success: false, error: "Organization name/code already exists" }
    }
    return { success: false, error: "Failed to create organization" }
  }
}

export async function deleteOrganizationAction(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  const org = await db.organization.findUnique({
    where: { id: organizationId }
  })

  if (!org) return { error: "Organization not found." }

  if (org.ownerId !== session.user.id) {
    return { error: "Only the owner can delete the organization." }
  }

  try {
    await db.organization.delete({
      where: { id: organizationId }
    })
    
    // Also reset user role if they don't own any other organizations
    const otherOrgs = await db.organization.findFirst({
      where: { ownerId: session.user.id }
    })
    
    if (!otherOrgs) {
      await db.user.update({
        where: { id: session.user.id },
        data: { role: UserRole.user }
      })
    }

    return { success: "Organization deleted successfully." }
  } catch (err) {
    console.error("Failed to delete organization:", err)
    return { error: "Failed to delete organization. Please try again." }
  }
}
