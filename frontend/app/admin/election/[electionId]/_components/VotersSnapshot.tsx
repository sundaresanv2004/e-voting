import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function VotersSnapshot({ electionId, totalVoters, totalBallots }: any) {
    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <HugeiconsIcon icon={UserCircleIcon} className="h-5 w-5 text-blue-500" />
                        Voter Participation
                    </CardTitle>
                    <CardDescription className="text-[11px] font-bold">
                        {totalVoters} Total {totalVoters === 1 ? "voter" : "voters"}
                    </CardDescription>
                </div>
                <Link href={`/admin/election/${electionId}/voters`}>
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
            <CardContent className="pt-4 pb-6">
                {totalVoters === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <HugeiconsIcon icon={UserCircleIcon} className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">No voters registered</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[
                            { label: "Voted", count: totalBallots, barClass: "bg-emerald-500", dotClass: "bg-emerald-500" },
                            { label: "Pending", count: totalVoters - totalBallots, barClass: "bg-amber-500", dotClass: "bg-amber-500" },
                        ].map(stat => {
                            const pct = (stat.count / totalVoters) * 100
                            return (
                                <div key={stat.label} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${stat.dotClass}`} />
                                            <span className="text-muted-foreground">{stat.label}</span>
                                        </div>
                                        <span className="font-medium tabular-nums">{stat.count}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${stat.barClass} transition-all duration-300`}
                                            style={{ width: `${Math.max(pct, stat.count > 0 ? 4 : 0)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function VotersSnapshotSkeleton() {
    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-1.5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-16" />
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-4" />
                        </div>
                        <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

