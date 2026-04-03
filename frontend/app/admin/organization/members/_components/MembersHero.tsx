import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

interface MembersHeroProps {
    title?: string;
    children?: React.ReactNode;
}

const MembersHero: React.FC<MembersHeroProps> = ({ title = "Organization Members", children }) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="border-b">
            <div className="flex flex-col space-y-4 py-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
                        <HugeiconsIcon icon={UserGroupIcon} className="h-6 w-6 text-blue-600" color="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <HugeiconsIcon icon={Calendar02Icon} className="mr-1.5 h-4 w-4" color="currentColor" />
                            <p>{currentDate}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default MembersHero
