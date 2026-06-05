import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface ElectionVotersSnapshotProps {
  electionId: string
  totalVoters: number
  totalBallots: number
}

export function ElectionVotersSnapshot({
  electionId,
  totalVoters,
  totalBallots,
}: ElectionVotersSnapshotProps) {
  const voted = totalBallots
  const pending = Math.max(totalVoters - totalBallots, 0)

  const stats = [
    {
      label: "Voted",
      count: voted,
      barClass: "bg-emerald-500",
      dotClass: "bg-emerald-500",
    },
    {
      label: "Pending",
      count: pending,
      barClass: "bg-amber-500",
      dotClass: "bg-amber-500",
    },
  ]

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={UserCircleIcon} className="h-5 w-5 text-blue-500" />
            Voter Participation
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {totalVoters} total {totalVoters === 1 ? "voter" : "voters"}
          </CardDescription>
        </div>
        <Link href={`/organisation/election/${electionId}/voters`}>
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
        {totalVoters === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={UserCircleIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No voters registered yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map((stat) => {
              const pct = totalVoters > 0 ? (stat.count / totalVoters) * 100 : 0
              return (
                <div key={stat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${stat.dotClass}`} />
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-medium tabular-nums">{stat.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stat.barClass}`}
                      style={{
                        width: `${Math.max(pct, stat.count > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
