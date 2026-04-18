"use client"

import React, { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, Image01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import Image from "next/image"

interface BallotInterfaceProps {
    election: any
    voterData: any
    onSubmitBallot: (votes: Record<string, string>) => void
    isSubmitting: boolean
}

export function BallotInterface({ election, voterData, onSubmitBallot, isSubmitting }: BallotInterfaceProps) {
    const [votes, setVotes] = useState<Record<string, string>>({})
    const [activeRoleIndex, setActiveRoleIndex] = useState(0)
    const [isReviewing, setIsReviewing] = useState(false)

    // Sort roles by order
    const roles = [...(election.roles || [])].sort((a, b) => a.order - b.order)
    const settings = election.settings || {}

    const currentRole = roles[activeRoleIndex]
    const currentVote = currentRole ? votes[currentRole.id] : null

    const handleVoteChange = (roleId: string, candidateId: string) => {
        setVotes(prev => ({ ...prev, [roleId]: candidateId }))

        // Auto-advance after a short delay for better UX
        if (activeRoleIndex < roles.length - 1) {
            setTimeout(() => {
                setActiveRoleIndex(prev => prev + 1)
            }, 600)
        } else {
            // If it's the last role, we don't automatically jump to review to let them see their selection
        }
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

    if (!roles.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-xl font-bold">No election roles found.</p>
                <p className="text-muted-foreground">Please contact your administrator.</p>
            </div>
        )
    }

    return (
        <>
            <div className="w-full max-w-5xl mx-auto space-y-8 pb-32 z-10 animate-in fade-in duration-500">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">{election.name}</h2>
                </div>

                {/* Main Content Area - Integrated into page (No card wrapper) */}
                <div className="min-h-[500px] flex flex-col relative">
                    {!isReviewing ? (
                        <div className="flex-1 space-y-12 animate-in slide-in-from-right-8 fade-in duration-300" key={currentRole.id}>
                            <div className="border-b border-border/50 pb-4 text-center">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">{currentRole.name}</h3>
                            </div>

                            <RadioGroup
                                value={votes[currentRole.id] || ""}
                                onValueChange={(val) => handleVoteChange(currentRole.id, val)}
                                className="flex flex-wrap justify-center gap-6 p-4 md:p-8"
                            >
                                {currentRole.candidates.map((candidate: any) => {
                                    const isSelected = votes[currentRole.id] === candidate.id

                                    return (
                                        <div key={candidate.id} className="relative w-full sm:w-[260px]">
                                            <RadioGroupItem
                                                value={candidate.id}
                                                id={`candidate-${candidate.id}`}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={`candidate-${candidate.id}`}
                                                className={`flex flex-col h-full rounded-3xl border-2 p-3 cursor-pointer transition-all duration-300 hover:shadow-xl ${isSelected
                                                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20 scale-[1.02]"
                                                    : "border-border bg-card/80 hover:border-primary/40 hover:bg-card"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center text-center gap-4">
                                                    {/* Media Container (Side by Side) */}
                                                    <div className="flex items-end justify-center gap-3">
                                                        {/* Profile Image */}
                                                        {settings.showCandidateProfiles && (
                                                            <div className="relative aspect-[3/4] w-24 shrink-0 rounded-2xl border border-border/50 bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                                                                {candidate.profileImage ? (
                                                                    <Image src={candidate.profileImage} alt={candidate.name} fill className="object-cover" />
                                                                ) : (
                                                                    <HugeiconsIcon icon={UserIcon} className="w-8 h-8 text-muted-foreground/40" />
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Symbol Image */}
                                                        {settings.showCandidateSymbols && (
                                                            <div className="relative aspect-[3/4] w-16 shrink-0 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                                                                {candidate.symbolImage ? (
                                                                    <Image src={candidate.symbolImage} alt="Symbol" fill className="object-contain" />
                                                                ) : (
                                                                    <div className="w-full h-full border border-dashed border-border/50 rounded-xl flex items-center justify-center">
                                                                        <HugeiconsIcon icon={Image01Icon} className="w-5 h-5 text-muted-foreground/40" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col w-full mt-2">
                                                        <p className="text-xl font-bold text-foreground break-words px-1 leading-tight">{candidate.name}</p>
                                                    </div>

                                                    {/* Selection Indicator (Small Size) */}
                                                    <div className={`absolute top-4 right-4 shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "border-muted-foreground/30 bg-card"
                                                        }`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-8 animate-in zoom-in-95 fade-in duration-300">
                            <div className="space-y-2 border-b border-border/50 pb-6 text-center">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">Review Your Selections</h3>
                                <p className="text-sm text-muted-foreground font-medium">Please confirm your choices before casting your ballot.</p>
                            </div>

                            <div className="space-y-4 max-w-3xl mx-auto">
                                {roles.map((role: any) => {
                                    const selectedCandidateId = votes[role.id]
                                    const candidate = role.candidates.find((c: any) => c.id === selectedCandidateId)

                                    return (
                                        <div key={role.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{role.name}</p>
                                                {candidate ? (
                                                    <p className="text-lg font-bold text-foreground">{candidate.name}</p>
                                                ) : (
                                                    <p className="text-lg font-bold text-destructive">No Selection Made</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="font-bold border border-border/50 hover:bg-background"
                                                onClick={() => {
                                                    setIsReviewing(false)
                                                    setActiveRoleIndex(roles.findIndex(r => r.id === role.id))
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Footer Navigation */}
                    <div className="pt-8 mt-auto border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleBack}
                            disabled={activeRoleIndex === 0 && !isReviewing || isSubmitting}
                            className="h-12 w-full md:w-auto px-8 rounded-xl font-bold order-2 md:order-1"
                        >
                            {isReviewing ? "Back to Ballot" : "Previous"}
                        </Button>

                        {/* Progress - Bottom Center */}
                        <div className="w-full max-w-sm flex-1 order-1 md:order-2">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-muted-foreground px-1">
                                    <span>{isReviewing ? "Review" : `Step ${activeRoleIndex + 1} of ${roles.length}`}</span>
                                    <span>{Object.keys(votes).length} / {roles.length} Selected</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                                        style={{ width: isReviewing ? '100%' : `${((activeRoleIndex) / roles.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isReviewing ? (
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={!currentVote}
                                className="h-12 w-full md:w-auto px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 order-3"
                            >
                                {activeRoleIndex === roles.length - 1 ? "Review Choices" : "Next"}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting || Object.keys(votes).length < roles.length}
                                className="h-12 w-full md:w-auto px-8 rounded-xl font-black bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 order-3"
                            >
                                {isSubmitting ? "Submitting..." : "Cast Ballot"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Fixed Voter Info Badge */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 bg-card/90 border border-border py-2 px-4 rounded-full w-fit max-w-[90vw] z-50 animate-in slide-in-from-bottom-5">
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-border bg-muted">
                    {voterData.image ? (
                        <Image src={voterData.image} alt={voterData.name} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                            <HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>
                <p className="text-xs font-bold text-muted-foreground truncate">
                    Voting as: <span className="text-foreground">{voterData.name}</span> <span className="opacity-70 font-medium">({voterData.uniqueId})</span>
                </p>
            </div>
        </>
    )
}
