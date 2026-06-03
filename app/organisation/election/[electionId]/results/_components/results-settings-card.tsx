import { ElectionSettings } from "@prisma/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon, CheckmarkBadge01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

function SettingRow({ label, value }: { label: string; value: boolean | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {typeof value === "boolean" ? (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-semibold gap-1",
            value
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          <HugeiconsIcon
            icon={value ? CheckmarkBadge01Icon : Cancel01Icon}
            className="w-3 h-3"
          />
          {value ? "Enabled" : "Disabled"}
        </Badge>
      ) : (
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      )}
    </div>
  )
}

export function ResultsSettingsCard({ settings }: { settings: Partial<ElectionSettings> }) {
  if (!settings) return null
  return (
    <Card className="overflow-hidden gap-0 p-0 h-full">
      <CardHeader className="p-4 border-b bg-muted/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Election Settings
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col justify-center">
        <div className="space-y-1">
          <SettingRow label="Allow Online Voting" value={!!settings.allowOnlineVoting} />
          <SettingRow label="Authorize Voters" value={!!settings.authorizeVoters} />
          <SettingRow label="Allow Multiple Votes" value={!!settings.allowMultipleVotes} />
          {settings.allowMultipleVotes && (
            <SettingRow label="Max Votes Per User" value={settings.maxVotesPerUser ?? 1} />
          )}
          <SettingRow label="Allow NOTA" value={!!settings.allowNota} />
          <SettingRow label="Shuffle Candidates" value={!!settings.shuffleCandidates} />
        </div>
      </CardContent>
    </Card>
  )
}
