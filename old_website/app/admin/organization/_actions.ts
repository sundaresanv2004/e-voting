"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { requireOrgAdmin } from "@/lib/authz"

export async function logOrgCodeAccess(action: "revealed" | "copied") {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)

  await db.adminAuditLog.create({
    data: {
      action: action === "revealed" ? "ORG_CODE_REVEALED" : "ORG_CODE_COPIED",
      entityType: AuditEntityType.SECURITY,
      entityId: access.organizationId,
      adminId: access.userId,
      organizationId: access.organizationId,
      status: AuditStatus.SUCCESS,
      metadata: { organizationId: access.organizationId },
    },
  })

  return { success: true }
}
