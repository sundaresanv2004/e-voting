import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

export function RolesSnapshot({ electionId, roles, totalRoles, totalCandidates }: any) {
    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5 text-amber-500" />
                        Roles & Positions
                    </CardTitle>
                    <CardDescription className="text-[11px] font-bold">
                        {totalRoles} Contested {totalRoles === 1 ? "role" : "roles"}
                    </CardDescription>
                </div>
                <Link href={`/admin/election/${electionId}/roles`}>
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
                {roles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">No roles configured</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {roles.slice(0, 4).map((role: any, idx: number) => {
                            const pct = totalCandidates > 0 ? (role._count.candidates / totalCandidates) * 100 : 0
                            const colors = ["bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500"]
                            const color = colors[idx % colors.length]
                            return (
                                <div key={role.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${color}`} />
                                            <span className="text-muted-foreground truncate max-w-[180px]">{role.name}</span>
                                        </div>
                                        <span className="font-medium tabular-nums">{role._count.candidates}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${color} transition-all duration-300`}
                                            style={{ width: `${Math.max(pct, role._count.candidates > 0 ? 4 : 0)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                        {roles.length > 4 && (
                            <div className="pt-2 text-center">
                                <span className="text-[10px] text-muted-foreground font-bold">
                                    +{roles.length - 4} more roles
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function RolesSnapshotSkeleton() {
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
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-3 w-24" />
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

