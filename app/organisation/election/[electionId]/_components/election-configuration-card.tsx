import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface ElectionSettings {
  allowOnlineVoting: boolean
  authorizeVoters: boolean
  showCandidateProfiles: boolean
  showCandidateSymbols: boolean
  shuffleCandidates: boolean
  allowMultipleVotes: boolean
  allowNota: boolean
  showSummary: boolean
  quickElection: boolean
  lockResult: boolean
  maxVotesPerUser: number
}

interface ElectionConfigurationCardProps {
  electionId: string
  settings: ElectionSettings | null
}

export function ElectionConfigurationCard({
  electionId,
  settings,
}: ElectionConfigurationCardProps) {
  const configItems = [
    {
      label: "Online Voting",
      value: settings?.allowOnlineVoting ? "Enabled" : "Disabled",
      isEnabled: settings?.allowOnlineVoting ?? false,
    },
    {
      label: "Voter Auth",
      value: settings?.authorizeVoters ? "Required" : "Optional",
      isEnabled: settings?.authorizeVoters ?? false,
    },
    {
      label: "Candidate Profiles",
      value: settings?.showCandidateProfiles ? "Visible" : "Hidden",
      isEnabled: settings?.showCandidateProfiles ?? false,
    },
    {
      label: "Candidate Symbols",
      value: settings?.showCandidateSymbols ? "Visible" : "Hidden",
      isEnabled: settings?.showCandidateSymbols ?? false,
    },
    {
      label: "Shuffle Order",
      value: settings?.shuffleCandidates ? "Enabled" : "Disabled",
      isEnabled: settings?.shuffleCandidates ?? false,
    },
    {
      label: "Multiple Votes",
      value: settings?.allowMultipleVotes
        ? `Up to ${settings.maxVotesPerUser}`
        : "Disabled",
      isEnabled: settings?.allowMultipleVotes ?? false,
    },
    {
      label: "NOTA Option",
      value: settings?.allowNota ? "Enabled" : "Disabled",
      isEnabled: settings?.allowNota ?? false,
    },
    {
      label: "Vote Summary",
      value: settings?.showSummary ? "Visible" : "Hidden",
      isEnabled: settings?.showSummary ?? false,
    },
    {
      label: "Quick Election",
      value: settings?.quickElection ? "Enabled" : "Disabled",
      isEnabled: settings?.quickElection ?? false,
    },
    {
      label: "Lock Results",
      value: settings?.lockResult ? "Locked" : "Unlocked",
      isEnabled: settings?.lockResult ?? false,
    },
  ]

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5 text-indigo-500" />
            Configuration
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            Core election settings
          </CardDescription>
        </div>
        <Link href={`/organisation/election/${electionId}/settings`}>
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
      <CardContent className="p-0">
        {settings === null ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No settings configured yet.{" "}
              <Link
                href={`/organisation/election/${electionId}/settings`}
                className="font-bold text-primary underline-offset-2 hover:underline"
              >
                Configure now
              </Link>
            </p>
          </div>
        ) : (
          <div className="max-h-[320px] divide-y divide-border/50 overflow-y-auto">
            {configItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                <Badge
                  variant={item.isEnabled ? "default" : "secondary"}
                  className={`text-[9px] font-black uppercase tracking-tighter shadow-none ${
                    item.isEnabled
                      ? "border-none bg-primary/10 text-primary hover:bg-primary/20"
                      : ""
                  }`}
                >
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
