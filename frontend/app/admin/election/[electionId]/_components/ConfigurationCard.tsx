import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function ConfigurationCard({ electionId, settings }: any) {
    const configItems = [
        { label: "Online Voting", value: settings?.allowOnlineVoting ? "Enabled" : "Disabled", isEnabled: settings?.allowOnlineVoting },
        { label: "Offline Voting", value: settings?.allowOfflineVoting ? "Enabled" : "Disabled", isEnabled: settings?.allowOfflineVoting },
        { label: "Voter Auth", value: settings?.authorizeVoters ? "Required" : "Optional", isEnabled: settings?.authorizeVoters },
        { label: "Profiles", value: settings?.showCandidateProfiles ? "Visible" : "Hidden", isEnabled: settings?.showCandidateProfiles },
        { label: "Symbols", value: settings?.showCandidateSymbols ? "Visible" : "Hidden", isEnabled: settings?.showCandidateSymbols },
        { label: "Shuffle Order", value: settings?.shuffleCandidates ? "Enabled" : "Disabled", isEnabled: settings?.shuffleCandidates },
        { label: "Multiple Votes", value: settings?.allowMultipleVotes ? "Enabled" : "Disabled", isEnabled: settings?.allowMultipleVotes },
        { label: "NOTA Option", value: settings?.allowNota ? "Enabled" : "Disabled", isEnabled: settings?.allowNota },
    ]

    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5 text-indigo-600" />
                        Configuration
                    </CardTitle>
                    <CardDescription className="text-[11px] font-bold">
                        Core election settings
                    </CardDescription>
                </div>
                <Link href={`/admin/election/${electionId}/settings`}>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-[10px] uppercase font-bold tracking-wider px-2 gap-1"
                    >
                        Manage
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                    {configItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 px-4">
                            <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                            <Badge
                                variant={item.isEnabled ? "default" : "secondary"}
                                className={`text-[9px] font-black uppercase tracking-tighter ${item.isEnabled ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-none' : ''}`}
                            >
                                {item.value}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
