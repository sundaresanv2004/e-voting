"use client"

import Image from "next/image"
import Link from "next/link"
import HeroImage from "@/public/images/hero_image_optimized.png"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldKeyIcon, CheckmarkBadge01Icon, Clock01Icon, Layout01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

export function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
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

            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50" />

            <div className="relative z-10 w-full max-w-7xl cursor-default mx-auto px-4 sm:px-6 pt-20 pb-8 sm:pb-12 lg:py-16">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className="text-center lg:text-left space-y-6 sm:space-y-8">
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
                                E-Voting
                            </p>
                            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                                Modernize
                            </h1>
                            <div className="inline-block">
                                <span className="font-heading block text-transparent bg-clip-text bg-linear-to-r from-primary via-primary to-cyan-500 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                    Your Elections
                                </span>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl lg:max-w-none leading-relaxed font-medium">
                            E-Voting helps organizations replace manual processes with a secure, transparent, and efficient digital voting system. Perfect for schools, colleges, and organizations.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
                            <Button asChild size="lg" className="group w-full sm:w-auto">
                                <Link href="/admin/organization" className="inline-flex items-center gap-2">
                                    <HugeiconsIcon icon={Layout01Icon} className="w-4 h-4" strokeWidth={2} />
                                    Dashboard
                                    {/* <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" /> */}
                                </Link>
                            </Button>

                            <Button asChild size="lg" variant="outline" className="group w-full sm:w-auto">
                                <Link href="/auth/vote" className="inline-flex items-center gap-2">
                                    <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                    Vote Now
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 text-muted-foreground dark:text-gray-400 text-sm pt-4">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={2} className="w-5 h-5 text-green-600 dark:text-green-300" />
                                <span className="font-medium">Secure & Private</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-medium">Verified Results</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <span className="font-medium">Real-Time</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground dark:text-gray-400">
                            <Link href="/privacy" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
                                Terms of Service
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
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
                                    className="w-full h-auto object-contain drop-shadow-2xl"
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
