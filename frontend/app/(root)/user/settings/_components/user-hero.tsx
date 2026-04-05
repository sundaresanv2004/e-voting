import type React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, UserCircleIcon } from '@hugeicons/core-free-icons';

interface UserHeroProps {
    title?: string;
    description?: string;
    icon?: any;
    children?: React.ReactNode;
}

const UserHero: React.FC<UserHeroProps> = ({ 
    title = "User Settings", 
    description,
    icon = UserCircleIcon, 
    children 
}) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="relative overflow-hidden border-b">
            <div className="relative z-10 flex flex-col space-y-4 py-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-muted text-indigo-600 shadow-sm ring-1 ring-border">
                        <HugeiconsIcon icon={icon} className="h-6 w-6 relative z-10" color="currentColor" />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground">
                            {description ? (
                                <p className="font-medium">{description}</p>
                            ) : (
                                <>
                                    <HugeiconsIcon icon={Calendar02Icon} className="mr-1.5 h-4 w-4" color="currentColor" />
                                    <p className="font-medium">{currentDate}</p>
                                </>
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
