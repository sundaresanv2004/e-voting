"use client"

import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

interface CandidateHeroProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const CandidateHero: React.FC<CandidateHeroProps> = ({ title = "Candidates", subtitle, children }) => {
    return (
        <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col space-y-4 py-6 px-4 md:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
                <div className="flex items-center gap-4 text-left">
                    <div className="rounded-2xl bg-primary/10 p-3.5 ring-1 ring-primary/20 shadow-sm">
                        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="h-6 w-6 text-primary" color="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <div className="flex items-center text-sm text-muted-foreground font-medium">
                                <HugeiconsIcon icon={Archive01Icon} strokeWidth={2.5} className="mr-1.5 h-3.5 w-3.5" color="currentColor" />
                                <p>{subtitle}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default CandidateHero
