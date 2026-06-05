import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, InvoiceIcon, UserGroupIcon, ComputerIcon } from "@hugeicons/core-free-icons"

function MetricCard({ title, value, description, icon, color }: any) {
  return (
    <Card className="relative overflow-hidden group border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {title}
        </CardTitle>
        <HugeiconsIcon icon={icon} className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <p className="text-[10px] font-bold text-muted-foreground/70 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export function MetricCards({ election, turnoutPct, totalCandidates, activeSystems, pendingSystems }: any) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Voters" value={election._count.voters} description="Total Registered" icon={UserCircleIcon} color="text-blue-600" />
            <MetricCard 
                title="Turnout" 
                value={`${turnoutPct}%`} 
                description={`${election._count.ballots} Ballots Cast`} 
                icon={InvoiceIcon} 
                color={turnoutPct > 50 ? "text-emerald-600" : "text-amber-600"} 
            />
            <MetricCard title="Candidates" value={totalCandidates} description={`Across ${election._count.roles} Positions`} icon={UserGroupIcon} color="text-indigo-600" />
            <MetricCard title="Systems" value={activeSystems} description={`${pendingSystems} Awaiting Setup`} icon={ComputerIcon} color="text-purple-600" />
        </div>
    )
}

export function MetricCardsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="relative overflow-hidden group border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-3 w-24 rounded-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

