import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface Role {
  id: string
  name: string
  _count: { candidates: number }
}

interface ElectionRolesSnapshotProps {
  electionId: string
  roles: Role[]
  totalRoles: number
  totalCandidates: number
}

export function ElectionRolesSnapshot({
  electionId,
  roles,
  totalRoles,
  totalCandidates,
}: ElectionRolesSnapshotProps) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5 text-amber-500" />
            Roles & Positions
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {totalRoles} contested {totalRoles === 1 ? "role" : "roles"}
          </CardDescription>
        </div>
        <Link href={`/organisation/election/${electionId}/roles`}>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            Manage
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pb-6 pt-4">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No roles configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.slice(0, 5).map((role, idx) => {
              const pct =
                totalCandidates > 0
                  ? (role._count.candidates / totalCandidates) * 100
                  : 0
              const colors = [
                "bg-indigo-500",
                "bg-sky-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-500",
              ]
              const dotColors = [
                "bg-indigo-500",
                "bg-sky-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-500",
              ]
              const color = colors[idx % colors.length]
              const dotColor = dotColors[idx % dotColors.length]

              return (
                <div key={role.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                      <span className="max-w-[160px] truncate text-muted-foreground">
                        {role.name}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {role._count.candidates} candidate{role._count.candidates !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{
                        width: `${Math.max(pct, role._count.candidates > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {roles.length > 5 && (
              <div className="pt-1 text-center">
                <span className="text-[10px] font-bold text-muted-foreground">
                  +{roles.length - 5} more {roles.length - 5 === 1 ? "role" : "roles"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
