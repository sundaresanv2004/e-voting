import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Home01Icon } from '@hugeicons/core-free-icons'
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import SetTheme from "@/components/shared/setTheme"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-4 pt-20 md:p-8 relative overflow-hidden bg-gradient-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 w-full">
            <div className="absolute top-4 right-4 z-50">
                <SetTheme />
            </div>

            {/* Ripple Background for premium feel */}
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
                <div className="light:block dark:hidden">
                    <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60" />
            <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />

            <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-muted/50 border border-border/50 shadow-sm backdrop-blur-sm">
                    <HugeiconsIcon icon={Search01Icon} className="w-12 h-12 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
                    <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
                    <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
                    </p>
                </div>

                <Link href="/">
                    <Button size="lg" className="mt-4 gap-2">
                        <HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
