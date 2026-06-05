import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  MapsIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

interface OrgMetricCardsProps {
  totalMembers: number
  pendingInvites: number
  totalElections: number
  activeCount: number
}

const metrics = [
  {
    key: "totalMembers",
    label: "Total Members",
    subKey: "pendingInvites",
    subLabel: (n: number) => n === 0 ? "No pending invitations" : `${n} pending invitation${n !== 1 ? "s" : ""}`,
    icon: UserGroupIcon,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    key: "totalElections",
    label: "Total Elections",
    subKey: "activeCount",
    subLabel: (n: number) => n === 0 ? "No active elections" : `${n} currently active`,
    icon: MapsIcon,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    key: "activeCount",
    label: "Active Elections",
    subKey: null,
    subLabel: () => "Elections running now",
    icon: CheckmarkCircle02Icon,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
]

export function OrgMetricCards({
  totalMembers,
  pendingInvites,
  totalElections,
  activeCount,
}: OrgMetricCardsProps) {
  const values: Record<string, number> = {
    totalMembers,
    pendingInvites,
    totalElections,
    activeCount,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const value = values[metric.key]
        const subValue = metric.subKey ? values[metric.subKey] : null
        const Icon = metric.icon
        return (
          <Card key={metric.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.iconBg}`}>
                <HugeiconsIcon icon={Icon} className={`h-4 w-4 ${metric.iconColor}`} strokeWidth={2} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {subValue !== null ? metric.subLabel(subValue) : metric.subLabel(value)}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
