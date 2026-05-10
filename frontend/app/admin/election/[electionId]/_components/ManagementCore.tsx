import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { DashboardCircleIcon, ArrowRight01Icon, UserCircleIcon, UserGroupIcon, ShieldKeyIcon, Analytics01Icon } from "@hugeicons/core-free-icons"

function NavEntry({ title, desc, href, icon, index, total, hoverText }: any) {
    const isBottomRow = index >= total - 2
    const isLast = index === total - 1
    
    return (
        <Link 
            href={href}
            className={`p-6 hover:bg-muted/40 transition-all border-b sm:border-r sm:[&:nth-child(2n)]:border-r-0 flex items-center justify-between group ${isBottomRow ? 'sm:border-b-0' : ''} ${isLast ? 'border-b-0' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-muted text-muted-foreground ${hoverText}`}>
                    <HugeiconsIcon icon={icon} className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-sm tracking-tight">{title}</p>
                    <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{desc}</p>
                </div>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
        </Link>
    )
}

export function ManagementCore({ electionId }: { electionId: string }) {
    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <HugeiconsIcon icon={DashboardCircleIcon} className="h-5 w-5 text-primary" />
                        Management Core
                    </CardTitle>
                    <CardDescription className="text-[11px] font-bold">Configure and monitor your election</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    <NavEntry 
                        index={0}
                        total={4}
                        title="Candidate Slate" 
                        desc="Profiles & Symbol Setup" 
                        href={`/admin/election/${electionId}/candidates`} 
                        icon={UserGroupIcon} 
                        hoverText="group-hover:text-indigo-600"
                    />
                    <NavEntry 
                        index={1}
                        total={4}
                        title="Contested Roles" 
                        desc="Position Configuration" 
                        href={`/admin/election/${electionId}/roles`} 
                        icon={ShieldKeyIcon} 
                        hoverText="group-hover:text-amber-600"
                    />
                    <NavEntry 
                        index={2}
                        total={4}
                        title="Voter Database" 
                        desc="Admission IDs & Eligibility" 
                        href={`/admin/election/${electionId}/voters`} 
                        icon={UserCircleIcon} 
                        hoverText="group-hover:text-blue-600"
                    />
                    <NavEntry 
                        index={3}
                        total={4}
                        title="Results" 
                        desc="Data Verification & Export" 
                        href={`/admin/election/${electionId}/results`} 
                        icon={Analytics01Icon} 
                        hoverText="group-hover:text-emerald-600"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export function ManagementCoreSkeleton() {
    return (
        <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
                <div className="space-y-1.5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-6 border-b sm:border-r sm:[&:nth-child(2n)]:border-r-0 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-11 w-11 rounded-xl" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

