import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, ShieldKeyIcon } from '@hugeicons/core-free-icons';
import { Skeleton } from "@/components/ui/skeleton";

interface AuditHeroProps {
    title?: string;
    description?: string;
}

const AuditHero: React.FC<AuditHeroProps> = ({
    title = "Audit Logs",
    description = "Complete Administrative Activity History",
}) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="relative overflow-hidden border-b">
            <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
                <div className="flex items-center gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 group transition-all duration-300 hover:-rotate-3">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="h-7 w-7 relative z-10 transition-transform duration-300 group-hover:scale-110" color="currentColor" />
                    </div>
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] font-black tracking-widest text-muted-foreground/80">
                            <div className="flex items-center">
                                <HugeiconsIcon icon={Calendar01Icon} className="mr-1.5 h-3.5 w-3.5 text-primary" color="currentColor" />
                                <p>{currentDate}</p>
                            </div>
                            <span className="hidden sm:inline text-border">•</span>
                            <p>{description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                </div>
            </div>

            {/* Premium Decorations
            <div className="absolute top-0 right-0 -mr-24 -mt-24 h-64 w-64 bg-indigo-500/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-64 w-64 bg-indigo-500/5 rounded-full blur-3xl opacity-60" /> */}
        </div>
    )
}

export default AuditHero

export const AuditHeroSkeleton: React.FC = () => {
    return (
        <div className="relative overflow-hidden border-b">
            <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
                <div className="flex items-center gap-5">
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

