import { getElectionSettings } from "./_actions"
import { SettingsToggle } from "./_components/SettingsToggle"
import { ShieldKeyIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default async function ElectionSettingsPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const electionId = (await params).electionId
    const settings = await getElectionSettings(electionId)

    return (
        <div className="flex-1 space-y-8 p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-70">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="w-4 h-4" />
                    Security & Access
                </div>
                <h1 className="text-3xl font-black tracking-tight">Election Settings</h1>
                <p className="text-muted-foreground text-sm font-medium">
                    Configure specialized access rules and hardware restrictions for this election.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
            </div>
        </div>
    )
}
