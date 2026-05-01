"use client"

import React, { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, Image01Icon, Tick02Icon, ArrowLeft01Icon, ArrowRight01Icon, CheckmarkBadge01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons'
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BallotInterfaceProps {
    election: any
    voterData: any
    onSubmitBallot: (votes: Record<string, string>) => void
    onBack: () => void
    isSubmitting: boolean
}

export function BallotInterface({ election, voterData, onSubmitBallot, onBack, isSubmitting }: BallotInterfaceProps) {
    const [votes, setVotes] = useState<Record<string, string>>({})
    const [activeRoleIndex, setActiveRoleIndex] = useState(0)
    const [isReviewing, setIsReviewing] = useState(false)

    // Sort roles by order
    const roles = [...(election.roles || [])].sort((a, b) => a.order - b.order)
    const settings = election.settings || {}

    const currentRole = roles[activeRoleIndex]
    const currentVote = currentRole ? votes[currentRole.id] : null

    // Prepare candidates for the current role
    const candidates = React.useMemo(() => {
        if (!currentRole) return []
        let cands = [...(currentRole.candidates || [])]

        // Shuffle candidates if enabled
        if (settings.shuffleCandidates) {
            for (let i = cands.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cands[i], cands[j]] = [cands[j], cands[i]];
            }
        }

        // Append NOTA if enabled
        if (settings.allowNota) {
            cands.push({
                id: "NOTA",
                name: "None of the Above (NOTA)",
                isNota: true
            })
        }

        return cands
    }, [currentRole, settings.shuffleCandidates, settings.allowNota])

    const handleVoteChange = (roleId: string, candidateId: string) => {
        setVotes(prev => ({ ...prev, [roleId]: candidateId }))

        // Auto-advance after a short delay for better UX
        setTimeout(() => {
            if (activeRoleIndex < roles.length - 1) {
                setActiveRoleIndex(prev => prev + 1)
            } else {
                // Last role — go straight to review
                setIsReviewing(true)
            }
        }, 600)
    }

    const handleNext = () => {
        if (activeRoleIndex < roles.length - 1) {
            setActiveRoleIndex(prev => prev + 1)
        } else {
            setIsReviewing(true)
        }
    }

    const handleBack = () => {
        if (isReviewing) {
            setIsReviewing(false)
            setActiveRoleIndex(roles.length - 1)
        } else if (activeRoleIndex > 0) {
            setActiveRoleIndex(prev => prev - 1)
        }
    }

    const handleSubmit = () => {
        onSubmitBallot(votes)
    }

    const allVoted = Object.keys(votes).length === roles.length
    const progress = isReviewing ? 100 : ((activeRoleIndex) / roles.length) * 100

    if (!roles.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto px-4">
                <div className="h-20 w-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <HugeiconsIcon icon={Tick02Icon} className="w-10 h-10 opacity-50" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">Ballot Not Configured</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                        No election roles or candidates have been assigned to this session yet. Please contact your organization&apos;s election coordinator for support.
                    </p>
                </div>
                <Button variant="outline" onClick={onBack} className="rounded-xl px-6">
                    Return to Vote Screen
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* ─── Top Bar: Election Name (centered, full width) ─── */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="w-full flex items-center justify-center px-6 py-4 sm:px-8 sm:py-5">
                    <h2 className="text-base sm:text-lg font-bold text-foreground text-center">{election.name}</h2>
                </div>
            </header>

            {/* ─── Step indicator: fixed top-right corner ─── */}
            <div className="fixed top-3 right-4 sm:top-4 sm:right-6 z-40 flex items-center gap-2.5 bg-background/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-border/40">
                <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {isReviewing ? "Review" : `${activeRoleIndex + 1} / ${roles.length}`}
                </span>
                <div className="flex gap-1.5">
                    {roles.map((_: any, i: number) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                i < activeRoleIndex || isReviewing
                                    ? "w-5 bg-primary"
                                    : i === activeRoleIndex && !isReviewing
                                        ? "w-8 bg-primary"
                                        : "w-3 bg-muted-foreground/20"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* ─── Main Content (centered) ─── */}
            <main className="flex-1 flex items-start justify-center overflow-y-auto pb-32 pt-6 sm:pt-10 px-4">
                {!isReviewing ? (
                    <div
                        className="w-full max-w-2xl animate-in fade-in slide-in-from-right-6 duration-300"
                        key={currentRole.id}
                    >
                        {/* Role Title */}
                        <div className="text-center mb-10 sm:mb-12 space-y-2">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary/80">
                                Select your candidate
                            </p>
                            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                                {currentRole.name}
                            </h3>
                        </div>

                        {/* Candidate Grid - Vertical Cards */}
                        <RadioGroup
                            value={votes[currentRole.id] || ""}
                            onValueChange={(val) => handleVoteChange(currentRole.id, val)}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5"
                        >
                            {candidates.map((candidate: any) => {
                                const isSelected = votes[currentRole.id] === candidate.id

                                return (
                                    <div key={candidate.id} className="relative group">
                                        <RadioGroupItem
                                            value={candidate.id}
                                            id={`candidate-${candidate.id}`}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={`candidate-${candidate.id}`}
                                            className={cn(
                                                "relative flex flex-col justify-between text-left rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all duration-400 overflow-hidden",
                                                isSelected
                                                    ? "border-primary bg-primary/[0.04] shadow-[0_0_30px_-5px] shadow-primary/25 scale-[1.02]"
                                                    : "border-border/40 bg-card/80 hover:border-primary/30 hover:bg-card hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5"
                                            )}
                                        >
                                            <div className="flex w-full items-start justify-between gap-3 mb-4">
                                                {/* Left side: Profile Photo / NOTA */}
                                                {!candidate.isNota ? (
                                                    <div className="relative shrink-0">
                                                        {settings.showCandidateProfiles && (
                                                            <div className={cn(
                                                                "relative w-20 h-24 sm:w-24 sm:h-32 rounded-xl border-2 bg-muted flex items-center justify-center overflow-hidden transition-all duration-300",
                                                                isSelected
                                                                    ? "border-primary/40 shadow-lg shadow-primary/10"
                                                                    : "border-border/50 shadow-sm group-hover:border-border"
                                                            )}>
                                                                {candidate.profileImage ? (
                                                                    <Image src={candidate.profileImage} alt={candidate.name} fill className="object-cover" sizes="96px" />
                                                                ) : (
                                                                    <HugeiconsIcon icon={UserIcon} className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30" />
                                                                )}
                                                            </div>
                                                        )}
                                                        {!settings.showCandidateProfiles && (
                                                            <div className={cn(
                                                                "w-20 h-24 sm:w-24 sm:h-32 rounded-xl border-2 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-all duration-300",
                                                                isSelected
                                                                    ? "border-primary/40"
                                                                    : "border-border/50 group-hover:border-border"
                                                            )}>
                                                                <span className="text-2xl sm:text-3xl font-black text-primary/50">
                                                                    {candidate.name?.charAt(0)?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="relative shrink-0">
                                                        <div className={cn(
                                                            "w-20 h-24 sm:w-24 sm:h-32 rounded-xl border-2 border-dashed bg-muted/50 flex items-center justify-center transition-all duration-300",
                                                            isSelected
                                                                ? "border-primary/40 bg-primary/5"
                                                                : "border-border/60 group-hover:border-muted-foreground/30"
                                                        )}>
                                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={cn("transition-colors duration-300", isSelected ? "text-primary" : "text-muted-foreground/40")}>
                                                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Right side: Checkmark and Symbol */}
                                                <div className="flex flex-col items-end justify-between h-24 sm:h-32">
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                                            isSelected
                                                                ? "bg-primary border-primary text-primary-foreground scale-100"
                                                                : "border-muted-foreground/20 bg-transparent scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-100"
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-in zoom-in-50 duration-200">
                                                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>

                                                    {settings.showCandidateSymbols && !candidate.isNota && (
                                                        <div className="mt-auto">
                                                            {candidate.symbolImage ? (
                                                                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                                                                    <Image src={candidate.symbolImage} alt="Symbol" fill className="object-contain" sizes="48px" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
                                                                    <HugeiconsIcon icon={Image01Icon} className="w-4 h-4 text-muted-foreground/25" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Candidate Name */}
                                            <div className="w-full text-left mt-auto">
                                                <p className={cn(
                                                    "text-sm sm:text-base font-bold leading-tight transition-colors duration-300 max-w-full",
                                                    isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                                                )}>
                                                    {candidate.isNota ? "NOTA" : candidate.name}
                                                </p>

                                                {candidate.isNota && (
                                                    <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">
                                                        None of the Above
                                                    </p>
                                                )}
                                            </div>
                                        </Label>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    </div>
                ) : (
                    /* ─── Review Screen ─── */
                    <div className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="text-center mb-10 sm:mb-12 space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-2">
                                <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                                Review Your Ballot
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                                Please confirm your selections below before casting your vote. This action cannot be undone.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {roles.map((role: any, roleIndex: number) => {
                                const selectedCandidateId = votes[role.id]

                                // Reconstruct candidate including NOTA
                                let candidate = role.candidates.find((c: any) => c.id === selectedCandidateId)
                                if (selectedCandidateId === "NOTA") {
                                    candidate = { id: "NOTA", name: "None of the Above (NOTA)", isNota: true }
                                }

                                return (
                                    <div
                                        key={role.id}
                                        className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                                        style={{ animationDelay: `${roleIndex * 80}ms` }}
                                    >
                                        {/* Left: Selection indicator line */}
                                        <div className={cn(
                                            "absolute left-0 top-3 bottom-3 w-1 rounded-full transition-colors duration-300",
                                            candidate ? "bg-primary/60" : "bg-destructive/60"
                                        )} />

                                        {/* Candidate Photo */}
                                        {candidate && !candidate.isNota && (
                                            <div className="relative w-12 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border-2 border-border/50 shadow-sm">
                                                {settings.showCandidateProfiles && candidate.profileImage ? (
                                                    <Image src={candidate.profileImage} alt={candidate.name} fill className="object-cover" sizes="48px" />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full bg-primary/5">
                                                        <span className="text-sm font-black text-primary/40">
                                                            {candidate.name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {candidate && candidate.isNota && (
                                            <div className="w-12 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-border/50 flex items-center justify-center shrink-0">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40">
                                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        )}
                                        {!candidate && (
                                            <div className="w-12 h-16 rounded-xl bg-destructive/5 border-2 border-dashed border-destructive/20 flex items-center justify-center shrink-0">
                                                <span className="text-destructive/50 font-bold text-lg">?</span>
                                            </div>
                                        )}

                                        {/* Role & Candidate Name */}
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/70">{role.name}</p>
                                            {candidate ? (
                                                <p className="text-base sm:text-lg font-bold text-foreground truncate">{candidate.name}</p>
                                            ) : (
                                                <p className="text-base font-bold text-destructive">No Selection</p>
                                            )}
                                        </div>

                                        {/* Edit Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs font-bold text-muted-foreground hover:text-primary shrink-0 gap-1.5 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={() => {
                                                setIsReviewing(false)
                                                setActiveRoleIndex(roles.findIndex((r: any) => r.id === role.id))
                                            }}
                                        >
                                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-3.5 h-3.5" />
                                            Edit
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* ─── Fixed Bottom Navigation ─── */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/50">
                {/* Progress Bar */}
                <div className="h-0.5 w-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-4">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleBack}
                        disabled={(activeRoleIndex === 0 && !isReviewing) || isSubmitting}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-3 h-3" />
                        {isReviewing ? "Edit Ballot" : "Back"}
                    </Button>

                    {/* Center: Voter Badge */}
                    <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
                            {voterData.image ? (
                                <Image src={voterData.image} alt={voterData.name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                                    <HugeiconsIcon icon={UserIcon} className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground truncate max-w-[140px]">
                            {voterData.name}
                        </p>
                        {voterData.maxVotes > 1 && (
                            <>
                                <div className="w-[1px] h-3 bg-border mx-1" />
                                <span className="text-[10px] font-black text-primary/80 uppercase tracking-tighter">
                                    {voterData.maxVotes - voterData.ballotsCount} Remaining
                                </span>
                            </>
                        )}
                    </div>

                    {!isReviewing ? (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            disabled={!currentVote}
                        >
                            {activeRoleIndex === roles.length - 1 ? "Review" : "Next"}
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3" />
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !allVoted}
                            className="bg-emerald-600 hover:bg-emerald-500"
                        >
                            {isSubmitting ? "Submitting..." : "Cast Ballot"}
                            {!isSubmitting && <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-3 h-3" />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
