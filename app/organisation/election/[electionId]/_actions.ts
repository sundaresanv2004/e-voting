"use server"

import { db } from "@/lib/db"
import { requireOrgActionContext } from "@/lib/auth/access"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"

export async function logElectionCodeAccess(
  electionId: string,
  action: "revealed" | "copied"
) {
  const { userId, organizationId } = await requireOrgActionContext({
    action: action === "revealed" ? "ELECTION_CODE_REVEALED" : "ELECTION_CODE_COPIED",
    entityType: AuditEntityType.SECURITY,
    entityId: electionId,
    adminOnly: false,
  })

  await logAdminAction({
    adminId: userId,
    organizationId,
    action: action === "revealed" ? "ELECTION_CODE_REVEALED" : "ELECTION_CODE_COPIED",
    entityType: AuditEntityType.SECURITY,
    entityId: electionId,
    status: AuditStatus.SUCCESS,
    description: action === "revealed" ? "Election code was revealed" : "Election code was copied to clipboard",
    metadata: { electionId },
  })

  return { success: true }
}
