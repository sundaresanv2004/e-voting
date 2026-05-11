import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building06Icon, Calendar01Icon, Settings02Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardHeader({ election, organization, statusStyles }: any) {
    return (
        <div className="relative bg-background/50 border-b">
            <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full max-w-[1400px] mx-auto">
                <div className="flex items-center gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-card text-primary shadow-sm ring-1 ring-border/50 overflow-hidden">
                        {organization.logo ? (
                            <Image src={organization.logo} alt={organization.name} fill className="object-cover" sizes="56px" />
                        ) : (
                            <HugeiconsIcon icon={Building06Icon} className="h-7 w-7 relative z-10" color="currentColor" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {election.name}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-semibold tracking-wide">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-primary/70" />
                                <p>{format(election.startTime, "PPP")} — {format(election.endTime, "PPP")}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-widest ${statusStyles[election.status]}`}>
                                {election.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/admin/election/${election.id}/settings`}>
                        <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm active:scale-[0.98] transition-all">
                            <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
                            <span>Settings</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export function DashboardHeaderSkeleton() {
    return (
        <div className="relative bg-background/50 border-b">
            <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full max-w-[1400px] mx-auto">
                <div className="flex items-center gap-5">
                    <Skeleton className="h-14 w-14 rounded-[16px]" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded-lg" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-48 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
            </div>
        </div>
    )
}

