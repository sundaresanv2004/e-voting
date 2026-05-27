"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { AuditEntityType, AuditStatus, UserRole } from "@prisma/client"
import { requireElectionAccess } from "@/lib/authz"

export async function logElectionCodeAccess(electionId: string, action: "revealed" | "copied") {
  const session = await auth()
  const access = await requireElectionAccess(session?.user, electionId, [
    UserRole.ORG_ADMIN,
    UserRole.STAFF,
    UserRole.VIEWER,
  ])

  await db.adminAuditLog.create({
    data: {
      action: action === "revealed" ? "ELECTION_CODE_REVEALED" : "ELECTION_CODE_COPIED",
      entityType: AuditEntityType.SECURITY,
      entityId: electionId,
      adminId: access.userId,
      organizationId: access.organizationId,
      status: AuditStatus.SUCCESS,
      metadata: { electionId },
    },
  })

  return { success: true }
}
