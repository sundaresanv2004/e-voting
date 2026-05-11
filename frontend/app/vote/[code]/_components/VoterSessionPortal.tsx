"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react'
import { PlayIcon, Logout01Icon, CheckmarkBadge01Icon } from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VoterIdSchema } from "@/lib/schemas/vote"
import { verifyVoterUniqueIdAction, submitBallotAction } from "@/lib/actions/vote-actions"
import { z } from "zod"
import { toast } from "sonner"
import Image from "next/image"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { VoterIdDialog } from "./VoterIdDialog"
import { VoterConfirmDialog } from "./VoterConfirmDialog"
import { VoterPausedDialog } from "./VoterPausedDialog"
import { VoterExitDialog } from "./VoterExitDialog"
import { BallotInterface } from "./BallotInterface"
import SetTheme from "@/components/shared/setTheme"
import { cn } from "@/lib/utils"
import type { BallotElection, VoterData } from "./BallotInterface"

interface VoterSessionPortalProps {
    election: {
        id: string
        name: string
        organization: {
            name: string
            logo: string | null
        }
    }
}

export function VoterSessionPortal({ election }: VoterSessionPortalProps) {
    const router = useRouter()
    const [isIdDialogOpen, setIsIdDialogOpen] = useState(false)
    const [isVoterInfoDialogOpen, setIsVoterInfoDialogOpen] = useState(false)
    const [isPausedDialogOpen, setIsPausedDialogOpen] = useState(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
    const [isVoting, setIsVoting] = useState(false)
    const [isBallotSubmitted, setIsBallotSubmitted] = useState(false)
    const [isSubmittingBallot, setIsSubmittingBallot] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [voterData, setVoterData] = useState<VoterData | null>(null)
    const [ballotElection, setBallotElection] = useState<BallotElection | null>(null)
    const [lastUsedId, setLastUsedId] = useState("")
    const [hasConfirmedIdentity, setHasConfirmedIdentity] = useState(false)
    const [verificationError, setVerificationError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof VoterIdSchema>>({
        resolver: zodResolver(VoterIdSchema),
        defaultValues: { uniqueId: "" }
    })

    const toastShown = React.useRef(false)

    // Handle mounting for theme consistency and welcome toast
    useEffect(() => {
        if (!toastShown.current) {
            toast.info("Secure Session Initiated", {
                description: "Your identification will be required before the ballot opens.",
                duration: 4000
            })
            toastShown.current = true
        }
    }, [])


    // Monitor fullscreen status
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && (isIdDialogOpen || isVoterInfoDialogOpen || isPausedDialogOpen || isVoting)) {
                setIsIdDialogOpen(false)
                setIsVoterInfoDialogOpen(false)
                setIsPausedDialogOpen(false)
                setIsVoting(false) // Dump out of ballot if they exit
                toast.warning("Focused voting mode was interrupted. Please re-enable fullscreen to continue.")
            }
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [isIdDialogOpen, isPausedDialogOpen, isVoterInfoDialogOpen, isVoting])

    const handleIdDialogOpenChange = (open: boolean) => {
        setIsIdDialogOpen(open)
        if (!open) {
            setVerificationError(null)
        }
    }

    const handleExitClick = () => {
        setIsExitDialogOpen(true)
    }

    const handleConfirmExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { })
        }
        setIsVoting(false)
        setIsBallotSubmitted(false)
        setVoterData(null)
        setBallotElection(null)
        setHasConfirmedIdentity(false)
        setLastUsedId("")
        form.reset()
        toast.info("Session Concluded", {
            description: "You have exited the election portal."
        })
        router.push("/auth/vote")
    }

    const handleCancelBallot = () => {
        setIsVoting(false)
        setVoterData(null)
        setBallotElection(null)
        setHasConfirmedIdentity(false)
        setLastUsedId("")
        form.reset()
        toast.info("Ballot cancelled", {
            description: "No vote was submitted."
        })
    }

    const handleStartAction = () => {
        if (!document.fullscreenElement) {
            const elem = document.documentElement
            if (elem.requestFullscreen) {
                elem.requestFullscreen().then(() => {
                    form.reset()
                    setIsIdDialogOpen(true)
                }).catch(() => {
                    toast.error("Focused voting mode is required. Please enable fullscreen to continue.")
                })
                return
            }
        }
        form.reset()
        setIsIdDialogOpen(true)
    }

    const verifyVoter = (uniqueId: string) => {
        setVerificationError(null)
        setLastUsedId(uniqueId)
        startTransition(async () => {
            const result = await verifyVoterUniqueIdAction(election.id, uniqueId)

            if (result.error) {
                if (result.status === "PAUSED") {
                    setIsIdDialogOpen(false)
                    setIsPausedDialogOpen(true)
                } else {
                    setVerificationError(result.error)
                }
                return
            }

            if (result.voter) {
                setVoterData(result.voter)
                setBallotElection(result.ballot)
                setHasConfirmedIdentity(false) // Reset for new voter
                setIsIdDialogOpen(false)
                setIsPausedDialogOpen(false)
                setIsVoterInfoDialogOpen(true)
            }
        })
    }

    const onIdSubmit = (values: z.infer<typeof VoterIdSchema>) => {
        verifyVoter(values.uniqueId)
    }

    const handleRetryVerification = () => {
        if (lastUsedId) {
            verifyVoter(lastUsedId)
        }
    }

    const handleStartVoting = () => {
        if (!hasConfirmedIdentity || !ballotElection) return
        toast.success("Identity Verified", {
            description: `Welcome, ${voterData?.name}. Your ballot is ready.`,
            duration: 3000
        })
        setIsVoterInfoDialogOpen(false)
        setIsVoting(true)
    }

    const handleChangeId = () => {
        setHasConfirmedIdentity(false)
        setIsVoterInfoDialogOpen(false)
        setBallotElection(null)
        setIsIdDialogOpen(true)
    }

    const handleSubmitBallot = async (votes: Record<string, string>) => {
        if (!voterData) return

        setIsSubmittingBallot(true)
        try {
            const result = await submitBallotAction(election.id, voterData.id, votes)

            if (result.error) {
                if (result.status === "PAUSED") {
                    setIsSubmittingBallot(false)
                    setIsVoting(false) // Exit the ballot interface
                    setIsPausedDialogOpen(true)
                } else {
                    toast.error(result.error)
                    setIsSubmittingBallot(false)
                }
                return
            }

            toast.success("Ballot submitted successfully!")
            setIsSubmittingBallot(false)
            setIsVoting(false)
            setIsBallotSubmitted(true)
            setVoterData(null)
            setBallotElection(null)
            setHasConfirmedIdentity(false)
            setLastUsedId("")
            form.reset()

        } catch {
            toast.error("Failed to submit ballot. Please try again.")
            setIsSubmittingBallot(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-primary/20">
            {/* Premium Background Gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] animate-pulse duration-[8s]" />
                <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[80px]" />
            </div>

            {/* Ripple Background Effect */}
            <div className="absolute inset-0 opacity-60 dark:opacity-40 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        maskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.6) 60%, transparent 100%)",
                    }}
                >
                    <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
                </div>
            </div>

            {/* Content Overlays */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-background/20 to-background/80" />



            {/* Controls - Top Right */}
            <div className={`absolute top-4 right-4 z-50 flex items-center gap-2 transition-opacity duration-300 ${isVoting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitClick}
                    className="text-destructive border-destructive/20 hover:border-destructive hover:bg-destructive/10 transition-colors hover:text-destructive h-9 px-3"
                >
                    <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                    Exit
                </Button>
                <div className="w-[1px] h-4 bg-border/40 mx-1" />
                <SetTheme />
            </div>

            {/* Submitted Screen */}
            {!isVoting && isBallotSubmitted && (
                <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8 z-10 transition-all duration-500">
                    <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                            Ballot Submitted
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground break-words">
                            Thank you for voting
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Your ballot for {election.name} has been recorded. You may now leave this device or return to the voting portal.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full max-w-xs rounded-xl bg-emerald-600 hover:bg-emerald-500"
                        onClick={handleConfirmExit}
                    >
                        Leave Portal
                    </Button>
                </div>
            )}

            {/* Main Content - Entry Screen */}
            {!isVoting && !isBallotSubmitted && (
                <div className="max-w-4xl w-full flex flex-col items-center space-y-16 z-10 -mt-24 transition-all duration-500">
                    {/* Organization Logo - Clean & Integrated */}
                    {election.organization.logo && (
                        <div className="relative w-full max-w-[400px] md:max-w-[550px] aspect-[2258/476]">
                            <Image
                                src={election.organization.logo}
                                alt={election.organization.name}
                                fill
                                className={cn(
                                    "object-contain transition-all duration-300",
                                    election.organization.logo.toLowerCase().endsWith(".svg") && "brightness-0 dark:invert"
                                )}
                                priority
                            />
                        </div>
                    )}

                    {/* Election Information */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-400/30 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold tracking-[0.2em] uppercase transition-all">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            Live Election Session
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight lg:text-6xl break-words">
                            {election.name}
                        </h1>
                        <p className="text-muted-foreground dark:text-foreground/60 max-w-sm mx-auto text-sm md:text-base leading-relaxed font-medium">
                            This online ballot opens after voter identification. Keep your unique voter ID ready.
                        </p>
                    </div>

                    {/* Start Election Button */}
                    <div className="w-full flex justify-center pt-8">
                        <Button
                            size="lg"
                            className="w-full max-w-xs h-13 rounded-xl text-base font-bold shadow-lg shadow-emerald-500/10 group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/20 transition-all duration-300 active:scale-[0.98]"
                            onClick={handleStartAction}
                        >
                            <span className="relative flex items-center gap-2.5">
                                <HugeiconsIcon icon={PlayIcon} className="w-5 h-5 fill-current" />
                                Start Election
                            </span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Voting Interface */}
            {isVoting && voterData && ballotElection && (
                <div className="absolute inset-0 overflow-y-auto no-scrollbar z-20 bg-background animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BallotInterface
                        election={ballotElection}
                        voterData={voterData}
                        onSubmitBallot={handleSubmitBallot}
                        onBack={handleCancelBallot}
                        isSubmitting={isSubmittingBallot}
                    />
                </div>
            )}

            {/* Voter ID Dialog */}
            <VoterIdDialog
                open={isIdDialogOpen}
                onOpenChange={handleIdDialogOpenChange}
                form={form}
                onSubmit={onIdSubmit}
                isPending={isPending}
                verificationError={verificationError}
            />

            {/* Voter Confirmation Dialog */}
            <VoterConfirmDialog
                open={isVoterInfoDialogOpen && !isVoting}
                onOpenChange={setIsVoterInfoDialogOpen}
                voterData={voterData}
                hasConfirmed={hasConfirmedIdentity}
                onConfirmChange={setHasConfirmedIdentity}
                onStartVoting={handleStartVoting}
                onChangeId={handleChangeId}
            />

            {/* Paused Election Dialog */}
            <VoterPausedDialog
                open={isPausedDialogOpen}
                onOpenChange={setIsPausedDialogOpen}
                onRetry={handleRetryVerification}
                onExit={handleConfirmExit}
                isPending={isPending}
            />
            {/* Exit Confirmation Dialog */}
            <VoterExitDialog
                open={isExitDialogOpen}
                onOpenChange={setIsExitDialogOpen}
                onConfirm={handleConfirmExit}
            />
        </div>
    )
}
