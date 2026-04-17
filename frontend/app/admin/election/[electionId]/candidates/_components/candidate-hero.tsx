import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

interface CandidateHeroProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
}

const CandidateHero: React.FC<CandidateHeroProps> = ({ title = "Election Candidates", subtitle, children, actions }) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="relative overflow-hidden border-b bg-card/50 backdrop-blur-sm">
            <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
                <div className="flex items-center gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 shadow-sm ring-1 ring-violet-500/20 group transition-all duration-300 hover:rotate-3">
                        <HugeiconsIcon icon={UserGroupIcon} className="h-7 w-7 relative z-10 transition-transform duration-300 group-hover:scale-110" color="currentColor" />
                        <div className="absolute inset-0 bg-violet-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground/80 font-semibold tracking-wide">
                            <HugeiconsIcon icon={Calendar02Icon} className="mr-1.5 h-4 w-4 text-primary" color="currentColor" />
                            <p>{subtitle || currentDate}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10 transition-all">
                    {actions}
                    {children}
                </div>
            </div>

            {/* Premium Decorations */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 h-64 w-64 bg-violet-500/5 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-64 w-64 bg-primary/5 rounded-full blur-3xl opacity-60" />
        </div>
    )
}

export default CandidateHero
