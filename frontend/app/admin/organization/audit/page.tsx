import Link from "next/link"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon } from "@hugeicons/core-free-icons"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { requireOrgAdmin } from "@/lib/authz"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const statusStyles: Record<string, string> = {
  SUCCESS: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  FAILURE: "bg-red-500/10 text-red-700 border-red-500/20",
  WARNING: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  INFO: "bg-blue-500/10 text-blue-700 border-blue-500/20",
}

function formatMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null

  const entries = Object.entries(metadata as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 4)

  if (entries.length === 0) return null

  return entries.map(([key, value]) => {
    const renderedValue = typeof value === "object"
      ? JSON.stringify(value)
      : String(value)

    return `${key}: ${renderedValue}`
  }).join(" · ")
}

export default async function OrganizationAuditPage() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)

  const auditLogs = await db.adminAuditLog.findMany({
    where: { organizationId: access.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      <div className="border-b bg-background/80">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0 text-muted-foreground">
              <Link href="/admin/organization">
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Audit Log</h1>
              <p className="text-sm text-muted-foreground">
                Administrative activity recorded for this organization.
              </p>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 py-6 max-w-[1400px] mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Showing the latest {auditLogs.length} administrative events.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                No audit events have been recorded yet.
              </div>
            ) : (
              <div className="divide-y">
                {auditLogs.map((log) => {
                  const actor = log.admin?.name || log.admin?.email || "System"
                  const metadata = formatMetadata(log.metadata)

                  return (
                    <div key={log.id} className="p-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="font-bold">
                            {log.entityType}
                          </Badge>
                          <Badge variant="outline" className={statusStyles[log.status] || ""}>
                            {log.status}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground">
                            {format(log.createdAt, "PPp")}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{log.description || log.action.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">By {actor}</p>
                        </div>
                        {metadata && (
                          <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                            {metadata}
                          </p>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground lg:text-right">
                        {log.entityId || log.id}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
