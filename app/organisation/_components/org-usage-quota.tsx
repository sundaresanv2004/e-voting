import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon, MapsIcon } from "@hugeicons/core-free-icons"

interface OrgUsageQuotaProps {
  currentMembers: number
  maxMembers: number
  currentElections: number
  maxElections: number
}

function UsageRow({
  icon,
  label,
  current,
  max,
  colorClass,
}: {
  icon: any
  label: string
  current: number
  max: number
  colorClass: string
}) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={icon} className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{current}</span> / {max}
        </span>
      </div>
      <Progress
        value={pct}
        className={`h-2 ${pct >= 90 ? "[&>*]:bg-red-500" : pct >= 70 ? "[&>*]:bg-amber-500" : colorClass}`}
      />
      <p className="text-xs text-muted-foreground">{pct}% used</p>
    </div>
  )
}

export function OrgUsageQuota({
  currentMembers,
  maxMembers,
  currentElections,
  maxElections,
}: OrgUsageQuotaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quota & Usage</CardTitle>
        <CardDescription>Organization resource limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <UsageRow
          icon={UserGroupIcon}
          label="Members"
          current={currentMembers}
          max={maxMembers}
          colorClass="[&>*]:bg-blue-500"
        />
        <UsageRow
          icon={MapsIcon}
          label="Elections"
          current={currentElections}
          max={maxElections}
          colorClass="[&>*]:bg-violet-500"
        />
      </CardContent>
    </Card>
  )
}
