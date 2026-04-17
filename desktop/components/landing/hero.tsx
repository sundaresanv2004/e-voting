"use client"

import Image from "next/image"
import Link from "next/link"
import HeroImage from "@/public/images/hero_image_optimized.png"
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowRight01Icon,
    CheckmarkBadge01Icon,
    Clock01Icon,
    ShieldKeyIcon,
    Building04Icon,
    LinkSquare01Icon,
} from '@hugeicons/core-free-icons';
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { Button } from "@/components/ui/button"
import { openExternalUrl } from "@/lib/utils/external-url"

export default function Hero() {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
            <div
                className="absolute inset-0 opacity-80 dark:opacity-60"
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

            <div
                className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60" />

            <div
                className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />

            {/* Main content container */}
            <div className="relative z-10 w-full max-w-7xl cursor-default mx-auto px-4 sm:px-6 pt-20 pb-8 sm:pb-12 lg:py-16 pointer-events-none">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left side - Content */}
                    <div className="text-center lg:text-left space-y-6 sm:space-y-8 pointer-events-auto">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/20 to-primary/10 dark:from-blue-500/25 dark:to-blue-600/15 border border-primary/40 dark:border-blue-500/50 rounded-full backdrop-blur-xl hover:backdrop-blur-2xl transition-all duration-300 hover:from-primary/25 hover:to-primary/15 dark:hover:from-blue-500/35 dark:hover:to-blue-600/25">
                            <div className="w-2 h-2 bg-green-500 dark:bg-green-300 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-primary/90 dark:text-blue-300">Secure Digital Elections</span>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground dark:text-white tracking-tight leading-tight">
                                Modernize
                            </h1>
                            <div className="inline-block">
                                <span
                                    className="block bg-linear-to-r from-primary via-primary to-primary/70 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                    Your Elections
                                </span>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground dark:text-gray-300 max-w-xl lg:max-w-none leading-relaxed font-medium">
                            Replace manual processes with a secure, transparent, and efficient digital voting system.
                            Perfect for schools,
                            colleges, and organizations.
                        </p>

                        <div
                            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
                            <Button
                                size="lg"
                                className="group w-full sm:w-auto cursor-pointer"
                                onClick={() => openExternalUrl(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000")}
                            >
                                <HugeiconsIcon icon={Building04Icon} className="w-5 h-5" strokeWidth={2} />
                                Create Organisation
                                <HugeiconsIcon icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                                />
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="group w-full sm:w-auto"
                            >
                                <Link href="/auth/connect">
                                    <HugeiconsIcon icon={LinkSquare01Icon} className="w-5 h-5" strokeWidth={2} />
                                    Connect Organisation
                                </Link>
                            </Button>
                        </div>

                        <div
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 text-muted-foreground dark:text-gray-400 text-sm pt-4">
                            <div
                                className="flex items-center gap-2 hover:cursor-pointer hover:text-foreground dark:hover:text-green-300 transition-colors duration-300">
                                <HugeiconsIcon icon={ShieldKeyIcon}
                                    strokeWidth={2}
                                    className="w-5 h-5 text-green-600 dark:text-green-300"
                                />
                                <span className="font-medium">Secure & Private</span>
                            </div>
                            <div
                                className="flex items-center gap-2 hover:cursor-pointer hover:text-foreground dark:hover:text-blue-300 transition-colors duration-300">
                                <HugeiconsIcon icon={CheckmarkBadge01Icon}
                                    strokeWidth={2}
                                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                                />
                                <span className="font-medium">Verified Results</span>
                            </div>
                            <div
                                className="flex items-center gap-2 hover:cursor-pointer hover:text-foreground dark:hover:text-cyan-300 transition-colors duration-300">
                                <HugeiconsIcon icon={Clock01Icon}
                                    strokeWidth={2}
                                    className="w-5 h-5 text-teal-600 dark:text-teal-400"
                                />
                                <span className="font-medium">Real-Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Image (shown above content on small screens, right side on lg) */}
                    <div className="flex items-center justify-center pointer-events-none">
                        <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-lg">
                            <div
                                className="absolute -inset-12 lg:-inset-24 bg-linear-to-br from-primary/30 via-primary/10 to-transparent dark:from-blue-500/40 dark:via-blue-600/20 dark:to-transparent rounded-full blur-3xl opacity-70 animate-pulse" />

                            <div
                                className="absolute -inset-6 lg:-inset-12 bg-linear-to-tl from-accent/20 via-transparent to-primary/15 dark:from-cyan-500/30 dark:via-transparent dark:to-blue-500/25 rounded-full blur-2xl opacity-60 animate-pulse [animation-delay:1s]" />

                            <div className="relative">
                                <Image
                                    src={HeroImage}
                                    placeholder="blur"
                                    alt="Digital voting illustration"
                                    className="w-full h-auto object-contain drop-shadow-2xl dark:drop-shadow-lg dark:brightness-110"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
