import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  InvoiceIcon,
  UserGroupIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

interface ElectionMetricCardsProps {
  totalVoters: number
  uniqueVotersVoted: number
  totalCandidates: number
  totalRoles: number
  totalCategories: number
}

export function ElectionMetricCards({
  totalVoters,
  uniqueVotersVoted,
  totalCandidates,
  totalRoles,
  totalCategories,
}: ElectionMetricCardsProps) {
  const turnoutPct =
    totalVoters > 0 ? Math.round((uniqueVotersVoted / totalVoters) * 100) : 0

  const metrics = [
    {
      key: "voters",
      label: "Registered Voters",
      value: totalVoters,
      description: "Total voter registrations",
      icon: UserCircleIcon,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      key: "turnout",
      label: "Turnout",
      value: `${turnoutPct}%`,
      description: `${uniqueVotersVoted} of ${totalVoters} voters participated`,
      icon: InvoiceIcon,
      iconBg: turnoutPct > 50 ? "bg-emerald-500/10" : "bg-amber-500/10",
      iconColor: turnoutPct > 50 ? "text-emerald-500" : "text-amber-500",
    },
    {
      key: "candidates",
      label: "Candidate Slate",
      value: totalCandidates,
      description: `Across ${totalRoles} contested position${totalRoles !== 1 ? "s" : ""}`,
      icon: UserGroupIcon,
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      key: "roles",
      label: "Contested Positions",
      value: totalRoles,
      description:
        totalCategories > 0
          ? `${totalCategories} categor${totalCategories !== 1 ? "ies" : "y"}`
          : "No categories configured",
      icon: ShieldKeyIcon,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.key} className="relative overflow-hidden border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              {metric.label}
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.iconBg}`}
            >
              <HugeiconsIcon
                icon={metric.icon}
                className={`h-4 w-4 ${metric.iconColor}`}
                strokeWidth={2}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">{metric.value}</div>
            <p className="mt-1 text-[10px] font-bold text-muted-foreground/70">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
