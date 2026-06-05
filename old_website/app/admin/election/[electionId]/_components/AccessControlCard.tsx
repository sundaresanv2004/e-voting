import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Archive01Icon } from "@hugeicons/core-free-icons"
import { CopyRevealCode } from "./CopyRevealCode"

export function AccessControlCard({ electionId, code }: any) {
    return (
        <Card className="border-border/50 shadow-sm py-2 gap-0">
            <CardHeader className="px-4 py-3">
                <div className="space-y-0.5">
                    <CardTitle className="text-lg font-bold tracking-tight">Access Control</CardTitle>
                    <CardDescription className="text-[11px] font-bold">Election authorization details</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
                <CopyRevealCode code={code} electionId={electionId} />
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                        <HugeiconsIcon icon={Archive01Icon} className="h-3 w-3" />
                        Important Notice
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                        Authorized personnel can use this <strong>Election Code</strong> to securely access the voting session on the Desktop Terminal App. This code allows voters to enter the election and cast their ballots. Share only with trusted candidates or staff.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export function AccessControlCardSkeleton() {
    return (
        <Card className="border-border/50 shadow-sm py-2 gap-0">
            <CardHeader className="px-4 py-3">
                <div className="space-y-1.5">
                    <Skeleton className="h-5 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
                <div className="flex flex-col gap-2 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-24 rounded-full" />
                        <div className="flex gap-1">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                </div>
                <div className="p-4 rounded-xl border space-y-2">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-full rounded-full" />
                        <Skeleton className="h-3 w-full rounded-full" />
                        <Skeleton className="h-3 w-2/3 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

