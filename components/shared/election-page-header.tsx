import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Settings02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrgMember } from "@/lib/auth/access"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface ElectionPageHeaderProps {
  electionId: string
  title: string
  description?: string
  icon: any // Hugeicons icon reference
  actions?: React.ReactNode
  showSettings?: boolean
  isDashboard?: boolean
}

export async function ElectionPageHeader({ 
  electionId, 
  title, 
  description, 
  icon: Icon,
  actions,
  showSettings = true,
  isDashboard = false,
}: ElectionPageHeaderProps) {
  const { member } = await requireOrgMember()

  const election = await db.election.findFirst({
    where: { id: electionId, organizationId: member.organizationId, deletedAt: null },
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  })

  if (!election) notFound()

  return (
    <div className="relative border-b bg-background/50 backdrop-blur-sm">
      <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto max-w-[1400px]">
        <div className="flex items-center gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/50">
            <HugeiconsIcon icon={Icon} className="h-7 w-7 relative z-10" color="currentColor" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-3xl lg:text-3xl">
              {isDashboard ? election.name : title}
            </h1>
            
            {isDashboard ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm font-medium text-muted-foreground/80 tracking-wide">
                {description && <p>{description}</p>}
                
                {description && <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />}
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-primary/70" />
                    <span>
                      {format(election.startTime, "MMM d")} — {format(election.endTime, "MMM d, yyyy")}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-widest ${STATUS_STYLES[election.status] ?? ""}`}
                  >
                    {election.status}
                  </Badge>
                </div>
              </div>
            ) : (
              description ? (
                <p className="text-sm font-medium text-muted-foreground/80 tracking-wide">
                  {description} of <span className="font-semibold text-foreground/80">{election.name}</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground/80 tracking-wide">
                  Election: <span className="font-semibold text-foreground/80">{election.name}</span>
                </p>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          {showSettings && (
            <Link href={`/organisation/election/${election.id}/settings`}>
              <Button variant="outline" className="gap-2">
                <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
