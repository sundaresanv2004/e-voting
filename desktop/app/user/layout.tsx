"use client"

import React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Logout01Icon,
    DashboardSquare01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/shared/auth-guard"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import SetTheme from "@/components/shared/setTheme"
import { BackButton } from "@/components/shared/back-button"

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth()

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background relative flex flex-col">
                {/* Navigation Controls - Top Left */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-50">
                    <BackButton />
                </div>

                {/* Navigation Controls - Top Right */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg px-3"
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline text-xs font-semibold">Logout</span>
                    </Button>

                    <Button variant="outline" size="sm" asChild className="rounded-lg px-3 shadow-xs">
                        <Link href="/admin/organization">
                            <HugeiconsIcon icon={DashboardSquare01Icon} className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline text-xs font-semibold">Dashboard</span>
                        </Link>
                    </Button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <SetTheme />
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full pt-16 md:pt-0 flex flex-col">
                    {children}
                </main>

                {/* Background ambient accents */}
                <div className="fixed pointer-events-none top-0 left-1/4 w-1/2 h-1/4 bg-primary/5 blur-[120px] rounded-full z-0" />
                <div className="fixed pointer-events-none bottom-0 right-1/4 w-1/3 h-1/4 bg-indigo-500/5 blur-[100px] rounded-full z-0" />
            </div>
        </AuthGuard>
    )
}
