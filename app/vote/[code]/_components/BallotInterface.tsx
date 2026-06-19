"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { BallotElection, VoterData, BallotRole } from "./ballot/types"
export * from "./ballot/types"
import { BallotHeader } from "./ballot/BallotHeader"
import { BallotProgress } from "./ballot/BallotProgress"
import { BallotCandidateGrid } from "./ballot/BallotCandidateGrid"
import { BallotReview } from "./ballot/BallotReview"
import { BallotFooter } from "./ballot/BallotFooter"

interface BallotInterfaceProps {
    election: BallotElection
    voterData: VoterData
    onSubmitBallot: (votes: Record<string, string>) => void
    onBack: () => void
    isSubmitting: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stableHash(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
    }
    return hash >>> 0
}

function prepareRoles(election: BallotElection, voterId: string): BallotRole[] {
    const settings = election.settings

    return [...election.roles]
        .filter((role) => role.candidates.length > 0)
        .sort((a, b) => a.order - b.order)
        .map((role) => {
            let candidates = [...role.candidates]

            if (settings.shuffleCandidates) {
                candidates.sort((a, b) => {
                    const left = stableHash(`${election.id}:${voterId}:${role.id}:${a.id}`)
                    const right = stableHash(`${election.id}:${voterId}:${role.id}:${b.id}`)
                    return left - right
                })
            }

            if (settings.allowNota) {
                candidates.push({ id: "NOTA", name: "None of the Above (NOTA)", isNota: true })
            }

            return { ...role, candidates }
        })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BallotInterface({
    election,
    voterData,
    onSubmitBallot,
    onBack,
    isSubmitting,
}: BallotInterfaceProps) {
    const [votes, setVotes] = useState<Record<string, string>>({})
    const [activeRoleIndex, setActiveRoleIndex] = useState(0)
    const [isReviewing, setIsReviewing] = useState(false)
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

    const [roles] = useState(() => prepareRoles(election, voterData.id))
    const settings = election.settings

    const currentRole = roles[activeRoleIndex]
    const currentVote = currentRole ? votes[currentRole.id] : undefined
    const allVoted = roles.length > 0 && roles.every((r) => Boolean(votes[r.id]))
    const progress = roles.length === 0
        ? 0
        : isReviewing
            ? 100
            : ((activeRoleIndex + 1) / roles.length) * 100

    const handleVoteChange = (roleId: string, candidateId: string) => {
        const newVotes = { ...votes, [roleId]: candidateId }
        setVotes(newVotes)

        if (settings.quickElection) {
            setTimeout(() => {
                if (activeRoleIndex < roles.length - 1) {
                    setActiveRoleIndex((i) => i + 1)
                } else {
                    if (settings.showSummary) {
                        setIsReviewing(true)
                    } else {
                        onSubmitBallot(newVotes)
                    }
                }
            }, 300)
        }
    }

    const handleNext = () => {
        if (activeRoleIndex < roles.length - 1) {
            setActiveRoleIndex((i) => i + 1)
        } else {
            setIsReviewing(true)
        }
    }

    const handleBack = () => {
        if (isReviewing) {
            setIsReviewing(false)
            setActiveRoleIndex(roles.length - 1)
        } else if (activeRoleIndex > 0) {
            setActiveRoleIndex((i) => i - 1)
        }
    }

    const handleConfirmSubmit = () => {
        onSubmitBallot(votes)
    }

    // Empty ballot guard
    if (!roles.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto px-4">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <HugeiconsIcon icon={Image01Icon} className="w-8 h-8 opacity-50" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">No data or candidates to vote</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        There are currently no candidates available for you to vote for in this election.
                    </p>
                </div>
                <Button variant="outline" onClick={onBack} className="rounded-xl">
                    Exit
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <BallotHeader
                electionName={election.name}
                isSubmitting={isSubmitting}
                onCancel={() => setIsCancelDialogOpen(true)}
            />

            <BallotProgress
                isReviewing={isReviewing}
                activeRoleIndex={activeRoleIndex}
                totalRoles={roles.length}
            />

            <main className="flex-1 flex items-start justify-center overflow-y-auto pb-32 pt-8 sm:pt-12 px-4">
                {!isReviewing ? (
                    <BallotCandidateGrid
                        currentRole={currentRole}
                        currentVote={currentVote}
                        settings={settings}
                        onVoteChange={handleVoteChange}
                    />
                ) : (
                    <BallotReview
                        roles={roles}
                        votes={votes}
                        settings={settings}
                        onEditRole={(index) => {
                            setIsReviewing(false)
                            setActiveRoleIndex(index)
                        }}
                    />
                )}
            </main>

            <BallotFooter
                progress={progress}
                voterData={voterData}
                isReviewing={isReviewing}
                activeRoleIndex={activeRoleIndex}
                isSubmitting={isSubmitting}
                canGoNext={!!currentVote}
                canSubmit={allVoted}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={() => {
                    if (settings.quickElection) {
                        onSubmitBallot(votes)
                    } else {
                        setIsSubmitDialogOpen(true)
                    }
                }}
                isFirstRole={activeRoleIndex === 0 && !isReviewing}
                isLastRole={activeRoleIndex === roles.length - 1}
                showSummary={settings.showSummary}
                quickElection={settings.quickElection}
            />

            {/* ── Submit Confirmation Dialog ────────────────────────────── */}
            <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cast this ballot?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to submit your ballot for{" "}
                            <span className="font-semibold text-foreground">{election.name}</span> as{" "}
                            <span className="font-semibold text-foreground">{voterData.name}</span>.
                            After submission, your choices cannot be changed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Review Again</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-500"
                                disabled={isSubmitting}
                                onClick={handleConfirmSubmit}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner />
                                        Submitting...
                                    </>
                                ) : (
                                    "Confirm Cast Ballot"
                                )}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Cancel Ballot Confirmation Dialog ───────────────────────── */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this ballot?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your current selections will be cleared and no ballot will be submitted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Voting</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={onBack}>
                                Cancel Ballot
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
