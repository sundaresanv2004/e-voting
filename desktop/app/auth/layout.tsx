import type {ReactNode} from "react"
import Link from "next/link"
import SetTheme from "@/components/shared/setTheme"
import {BackButton} from "@/components/shared/back-button"
import {BackgroundRippleEffect} from "@/components/ui/background-ripple-effect"
import {ExternalLink} from "@/components/shared/external-link"

export default function AuthLayout({children}: { children: ReactNode }) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-start md:justify-center px-4 pb-4 pt-16 sm:pt-20 md:p-8 relative overflow-x-hidden overflow-y-auto bg-gradient-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 w-full">
            <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50">
                <BackButton/>
            </div>
            <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
                <SetTheme/>
            </div>

            <div
                className="fixed inset-0 opacity-80 dark:opacity-60 pointer-events-none"
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
                    <BackgroundRippleEffect rows={12} cols={24} cellSize={60}/>
                </div>
                <div className="light:block dark:hidden">
                    <BackgroundRippleEffect rows={12} cols={24} cellSize={60}/>
                </div>
            </div>

            <div
                className="fixed inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60"/>

            <div
                className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10"/>

            <div className="w-full max-w-lg relative z-10 flex-1 flex flex-col justify-center">
                {children}
            </div>

            <div className="relative z-10 w-full text-center space-y-3 sm:space-y-4 mt-4 sm:mt-6 pb-2">
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Link href="/terms" className="hover:text-primary transition-colors">
                        Terms & Conditions
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <ExternalLink href="mailto:contact@sundaresan.dev" className="hover:text-primary transition-colors cursor-pointer">
                        Help Center
                    </ExternalLink>
                </div>
                <div className="text-[10px] text-muted-foreground/60">
                    © {new Date().getFullYear()} E-Voting. All rights reserved.
                </div>
            </div>
        </div>
    )
}
