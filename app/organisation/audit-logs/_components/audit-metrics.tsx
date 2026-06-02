import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick01Icon,
  Cancel01Icon,
  Alert01Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons"

interface AuditMetricsProps {
  successCount: number
  failureCount: number
  warningCount: number
  infoCount: number
}

export function AuditMetrics({ successCount, failureCount, warningCount, infoCount }: AuditMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 text-emerald-500" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{successCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failures</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 text-red-500" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{failureCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 text-amber-500" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{warningCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Info Events</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-blue-500" strokeWidth={2} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{infoCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
