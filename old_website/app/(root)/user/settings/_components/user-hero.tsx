import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, UserCircleIcon } from '@hugeicons/core-free-icons';
import { cn } from "@/lib/utils"

interface UserHeroProps {
    title?: string;
    description?: string;
    icon?: any;
    color?: string;
    children?: React.ReactNode;
}

const UserHero: React.FC<UserHeroProps> = ({ 
    title = "Account Settings", 
    description,
    icon = UserCircleIcon, 
    color = "text-primary",
    children 
}) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="relative overflow-hidden rounded-3xl bg-card border shadow-sm w-full mb-8">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative z-10 flex flex-col space-y-6 py-8 px-6 sm:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-background shadow-md border",
                        color
                    )}>
                        <div className="absolute inset-0 rounded-[1.25rem] bg-current opacity-[0.03]" />
                        <HugeiconsIcon icon={icon} className="h-8 w-8 relative z-10" />
                    </div>
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground">
                            {description ? (
                                <p className="font-medium text-muted-foreground/80">{description}</p>
                            ) : (
                                <div className="flex items-center gap-2 font-medium text-muted-foreground/80">
                                    <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4" />
                                    <span>{currentDate}</span>
                                </div>
                            )}
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

export default UserHero

export function UserHeroSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-card border shadow-sm w-full mb-8">
            <div className="relative z-10 flex flex-col space-y-6 py-8 px-6 sm:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 w-full">
                <div className="flex items-center gap-6">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-muted shadow-md border animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}
