import { ElectionStatus } from "@prisma/client"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, CheckmarkCircle02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResultsStateBannerProps {
  status: ElectionStatus
  isFinalized: boolean
  finalizedAt?: Date | null
  ballotsCast: number
}

const bannerCopy: Record<ElectionStatus, { title: string; description: string; tone: string; icon: any }> = {
  UPCOMING: {
    title: "Results Not Started",
    description: "This election has not opened yet. Counts will appear only after ballots are recorded.",
    tone: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
    icon: InformationCircleIcon,
  },
  ACTIVE: {
    title: "Draft Results While Voting Is Open",
    description: "These numbers can still change. Do not treat them as final until the election is completed and finalized.",
    tone: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    icon: Alert01Icon,
  },
  PAUSED: {
    title: "Draft Results While Election Is Paused",
    description: "Voting is paused. Current counts are for review only and may change if the election resumes.",
    tone: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    icon: Alert01Icon,
  },
  COMPLETED: {
    title: "Completed Election Results",
    description: "Voting has ended. Review and export these results before sharing official outcomes.",
    tone: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    icon: CheckmarkCircle02Icon,
  },
  CANCELLED: {
    title: "Cancelled Election",
    description: "This election was cancelled. Results should not be treated as an official outcome.",
    tone: "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400",
    icon: Alert01Icon,
  },
}

export function ResultsStateBanner({ status, isFinalized, finalizedAt, ballotsCast }: ResultsStateBannerProps) {
  const config = isFinalized
    ? {
        title: "Finalized Official Results",
        description: finalizedAt
          ? `These results were finalized on ${finalizedAt.toLocaleString()}.`
          : "These results have been finalized and should be treated as the official record.",
        tone: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
        icon: CheckmarkCircle02Icon,
      }
    : bannerCopy[status]

  return (
    <div className={cn("rounded-xl border px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between", config.tone)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/70 ring-1 ring-current/10">
          <HugeiconsIcon icon={config.icon} className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-black tracking-tight text-foreground">{config.title}</h2>
          <p className="text-xs font-medium leading-relaxed">{config.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:justify-end">
        <Badge variant="outline" className="bg-background/70 font-bold">
          {isFinalized ? "FINALIZED" : status}
        </Badge>
        <Badge variant="outline" className="bg-background/70 font-bold">
          {ballotsCast} ballots
        </Badge>
      </div>
    </div>
  )
}
