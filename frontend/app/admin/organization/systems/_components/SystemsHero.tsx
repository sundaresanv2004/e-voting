"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, LaptopIcon, FingerPrintIcon } from '@hugeicons/core-free-icons';
import { OrganizationCodeDialog } from "@/app/admin/organization/systems/_components/OrganizationCodeDialog";
import { Button } from "@/components/ui/button";

interface SystemsHeroProps {
    title?: string;
    orgCode?: string;
    children?: React.ReactNode;
}

const SystemsHero: React.FC<SystemsHeroProps> = ({ title = "Authorized Systems", orgCode, children }) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
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
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-muted flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-border">
                        <HugeiconsIcon icon={LaptopIcon} className="h-6 w-6 relative z-10" color="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {title}
                        </h1>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <HugeiconsIcon icon={Calendar02Icon} className="mr-1.5 h-4 w-4" color="currentColor" />
                            <p className="font-medium">{currentDate}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {orgCode && (
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <HugeiconsIcon icon={FingerPrintIcon} className="h-4 w-4" />
                            <span>Organization Code</span>
                        </Button>
                    )}
                    {children}
                </div>
            </div>

            {orgCode && (
                <OrganizationCodeDialog
                    code={orgCode}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            )}
        </div>
    )
}

export default SystemsHero
