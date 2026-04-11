"use client"

import { ReactNode } from "react"
import { AuthGuard } from "@/components/shared/auth-guard"
import SetTheme from "@/components/shared/setTheme"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout01Icon } from '@hugeicons/core-free-icons'
import { useAuth } from "@/components/providers/auth-provider"
import { RootNavActions } from "../(root)/_components/nav-actions"

export default function SetupLayout({ children }: { children: ReactNode }) {
    const { logout } = useAuth()

    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-4 pt-20 md:p-8 relative overflow-hidden bg-gradient-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 w-full">
                {/* Top Actions */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                    <RootNavActions />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logout()}
                        className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                        Logout
                    </Button>
                    <div className="w-px ml-2 h-5 bg-border/50" />
                    <SetTheme />
                </div>

                {/* Animated Background */}
                <div
                    className="absolute inset-0 opacity-80 dark:opacity-60 pointer-events-none"
                    style={{
                        maskImage:
                            "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    }}
                >
                    <div
                        className="dark:block hidden absolute inset-0"
                        style={{
                            maskImage:
                                "radial-gradient(ellipse 140% 100% at 50% 30%, black 0%, black 15%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.04) 93%, transparent 100%)",
                            WebkitMaskImage:
                                "radial-gradient(ellipse 140% 100% at 50% 30%, black 0%, black 15%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.04) 93%, transparent 100%)",
                        }}
                    >
                        <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
                    </div>
                    <div className="block dark:hidden">
                        <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
                    </div>
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60" />
                <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />

                {/* Content Container */}
                <div className="w-full max-w-lg relative z-10">
                    {children}
                </div>
            </div>
        </AuthGuard>
    )
}
