"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { Button } from "@/components/ui/button"


export default function AuthLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const isSignUp = pathname === "/auth/signup"
    const isLogin = pathname === "/auth/login"

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-4 pt-20 md:p-8 relative overflow-hidden bg-linear-to-b from-blue-50/30 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background w-full">
            {/* Header / Nav */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <Button variant="ghost" className="group" asChild>
                        <Link href="/">
                            <HugeiconsIcon
                                icon={ArrowLeft01Icon}
                                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                            />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-1.5 pointer-events-auto">
                    {isSignUp && (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/auth/login">Login</Link>
                            </Button>
                            <div className="w-px h-4 bg-border mx-1" />
                        </>
                    )}
                    {isLogin && (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/auth/signup">Sign Up</Link>
                            </Button>
                            <div className="w-px h-4 bg-border mx-1" />
                        </>
                    )}
                    <ThemeSwitch />
                </div>
            </div>

            {/* Hero Background Pattern */}
            <div
                className="absolute inset-0 opacity-80 dark:opacity-60"
                style={{
                    maskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                }}
            >
                <div className="hidden dark:block absolute inset-0">
                    <BackgroundRippleEffect rows={20} cols={60} cellSize={60} />
                </div>
                <div className="block dark:hidden absolute inset-0">
                    <BackgroundRippleEffect rows={20} cols={60} cellSize={60} />
                </div>
            </div>

            {/* Fading bottom gradient */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-60 dark:opacity-70" />

            {/* Fading top gradient */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-blue-100/20 via-transparent to-transparent opacity-20 dark:from-blue-900/10 dark:opacity-30" />

            {/* Ambient blue background glow */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-20 bg-linear-to-br from-blue-500/5 via-transparent to-blue-400/5" />

            {/* Radial ambient glow at top center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none opacity-10 dark:opacity-10 rounded-full bg-blue-400/20 blur-3xl" />

            {/* Content & Footer Container */}
            <div className="w-full max-w-lg relative z-10 flex-1 flex flex-col justify-center gap-8 mt-8">
                <div className="w-full">
                    {children}
                </div>

                {/* Footer */}
                <div className="w-full text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Link href="/terms" className="hover:text-primary transition-colors">
                            Terms & Conditions
                        </Link>
                        <span className="text-muted-foreground/40">•</span>
                        <Link href="/privacy" className="hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <span className="text-muted-foreground/40">•</span>
                        <Link href="mailto:contact@sundaresan.dev" className="hover:text-primary transition-colors">
                            Help Center
                        </Link>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60">
                        © {new Date().getFullYear()} Sundaresan V. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    )
}
