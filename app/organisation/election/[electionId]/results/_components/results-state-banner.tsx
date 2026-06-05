import { ElectionStatus } from "@prisma/client"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResultsStateBannerProps {
  status: ElectionStatus
  isFinalized: boolean
  finalizedAt?: Date | null
  ballotsCast: number
}

const bannerConfig: Record<
  ElectionStatus,
  { title: string; description: string; className: string; icon: any }
> = {
  UPCOMING: {
    title: "Election Has Not Started",
    description:
      "This election has not opened yet. Results will appear once ballots are recorded.",
    className:
      "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
    icon: InformationCircleIcon,
  },
  ACTIVE: {
    title: "Live Draft Results",
    description:
      "Voting is currently open. These numbers will change — do not treat them as final.",
    className:
      "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    icon: Alert01Icon,
  },
  PAUSED: {
    title: "Election Paused — Draft Results",
    description:
      "Voting is paused. Current counts are for review only and may change if voting resumes.",
    className:
      "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    icon: Alert01Icon,
  },
  COMPLETED: {
    title: "Voting Complete",
    description:
      "Voting has ended. Review the results below and export an official report when ready.",
    className:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    icon: CheckmarkCircle02Icon,
  },
  CANCELLED: {
    title: "Election Cancelled",
    description:
      "This election was cancelled. Results below should not be treated as an official outcome.",
    className: "border-destructive/20 bg-destructive/5 text-destructive",
    icon: Cancel01Icon,
  },
}

export function ResultsStateBanner({
  status,
  isFinalized,
  finalizedAt,
  ballotsCast,
}: ResultsStateBannerProps) {
  const config = isFinalized
    ? {
        title: "Finalized Official Results",
        description: finalizedAt
          ? `These results were finalized on ${new Date(finalizedAt).toLocaleString()}.`
          : "These results have been finalized and are the official record.",
        className:
          "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
        icon: CheckmarkCircle02Icon,
      }
    : bannerConfig[status]

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        config.className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/70 ring-1 ring-current/10">
          <HugeiconsIcon icon={config.icon} className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {config.title}
          </h2>
          <p className="text-xs font-medium leading-relaxed opacity-80">
            {config.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:justify-end shrink-0">
        <Badge variant="outline" className="bg-background/70 font-semibold">
          {isFinalized ? "FINALIZED" : status}
        </Badge>
        <Badge variant="outline" className="bg-background/70 font-semibold tabular-nums">
          {ballotsCast.toLocaleString()} ballot{ballotsCast !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  )
}
