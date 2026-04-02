import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, MapsIcon } from '@hugeicons/core-free-icons';

interface ElectionHeroProps {
    title?: string;
    children?: React.ReactNode;
}

const ElectionHero: React.FC<ElectionHeroProps> = ({ title = "Elections", children }) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="border-b">
            <div className="flex flex-col space-y-4 py-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 px-4 md:px-8 w-full">
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
                        <HugeiconsIcon icon={MapsIcon} strokeWidth={2} className="h-6 w-6 text-primary" color="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <HugeiconsIcon icon={Calendar02Icon} strokeWidth={2} className="mr-1.5 h-4 w-4" color="currentColor" />
                            <p>{currentDate}</p>
                        </div>
                    </div>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ElectionHero
