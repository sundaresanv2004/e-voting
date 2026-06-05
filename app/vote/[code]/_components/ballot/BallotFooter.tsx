"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { VoterData } from "./types"

interface BallotFooterProps {
    progress: number
    voterData: VoterData
    isReviewing: boolean
    activeRoleIndex: number
    isSubmitting: boolean
    canGoNext: boolean
    canSubmit: boolean
    onBack: () => void
    onNext: () => void
    onSubmit: () => void
    isFirstRole: boolean
    isLastRole: boolean
    showSummary: boolean
    quickElection: boolean
}

export function BallotFooter({
    progress,
    voterData,
    isReviewing,
    activeRoleIndex,
    isSubmitting,
    canGoNext,
    canSubmit,
    onBack,
    onNext,
    onSubmit,
    isFirstRole,
    isLastRole,
    showSummary,
    quickElection,
}: BallotFooterProps) {
    return (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50">
            {/* Progress bar */}
            <Progress value={progress} className="h-0.5 rounded-none" />

            <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-4">
                {!quickElection ? (
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={onBack}
                        disabled={isFirstRole || isSubmitting}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
                        {isReviewing ? "Edit Ballot" : "Back"}
                    </Button>
                ) : (
                    <div className="w-[100px]" />
                )}

                {/* Center: Voter badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
                        {voterData.image ? (
                            <Image src={voterData.image} alt={voterData.name} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                                <HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground max-w-[160px] truncate">
                        {voterData.name}
                    </p>
                    {voterData.maxVotes > 1 && (
                        <>
                            <div className="w-px h-3 bg-border" />
                            <span className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                                {voterData.maxVotes - voterData.ballotsCount} Remaining
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {(!quickElection || isReviewing) && (
                        !isReviewing ? (
                            isLastRole && !showSummary ? (
                                <Button
                                    size="lg"
                                    onClick={onSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />
                                            Cast Ballot
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={onNext}
                                    disabled={!canGoNext}
                                >
                                    {isLastRole ? "Review" : "Next"}
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                                </Button>
                            )
                        ) : (
                            <Button
                                size="lg"
                                onClick={onSubmit}
                                disabled={isSubmitting || !canSubmit}
                                className="bg-emerald-600 hover:bg-emerald-500"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />
                                        Cast Ballot
                                    </>
                                )}
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
