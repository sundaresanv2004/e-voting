import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  MapsIcon,
  PauseIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OrgElectionSummaryProps {
  total: number
  active: number
  upcoming: number
  completed: number
  paused: number
  maxElections: number
}

const STATUS_CONFIG = [
  {
    key: "active",
    label: "Active",
    icon: CheckmarkCircle02Icon,
    colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    barClass: "bg-emerald-500",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: Clock01Icon,
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    barClass: "bg-blue-500",
  },
  {
    key: "paused",
    label: "Paused",
    icon: PauseIcon,
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    barClass: "bg-amber-500",
  },
  {
    key: "completed",
    label: "Completed",
    icon: MapsIcon,
    colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    barClass: "bg-slate-400",
  },
]

export function OrgElectionSummary({
  total,
  active,
  upcoming,
  completed,
  paused,
  maxElections,
}: OrgElectionSummaryProps) {
  const counts: Record<string, number> = { active, upcoming, completed, paused }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Elections Overview</CardTitle>
          <CardDescription>
            {total} of {maxElections} elections created
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/organisation/elections" className="gap-1.5">
            View All
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3 border border-border/50">
              <HugeiconsIcon icon={MapsIcon} className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No elections yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create your first election to get started.</p>
            <Button variant="default" size="sm" className="mt-4" asChild>
              <Link href="/organisation/elections?new=true">Create Election</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_CONFIG.map((s) => {
              const count = counts[s.key]
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const Icon = s.icon
              return (
                <div
                  key={s.key}
                  className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.colorClass}`}>
                    <HugeiconsIcon icon={Icon} className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight">{count}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${s.barClass}`}
                      style={{ width: `${pct}%` }}
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
