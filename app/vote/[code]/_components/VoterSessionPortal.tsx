"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    PlayIcon,
    Logout01Icon,
    CheckmarkBadge01Icon,
    Building03Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { VoterIdDialog } from "./VoterIdDialog"
import { VoterConfirmDialog } from "./VoterConfirmDialog"
import { VoterPausedDialog } from "./VoterPausedDialog"
import { VoterExitDialog } from "./VoterExitDialog"
import { BallotInterface } from "./BallotInterface"
import { verifyVoterUniqueIdAction, submitBallotAction } from "@/lib/actions/vote-actions"
import { voterIdSchema } from "@/lib/schemas/auth"
import type { BallotElection, VoterData } from "./BallotInterface"

interface ElectionInfo {
    id: string
    name: string
    status: string
    startTime: Date
    endTime: Date
    organization: {
        name: string
        logo: string | null
        settings?: {
            allowCustomBranding: boolean
        } | null
    }
    settings: {
        allowOnlineVoting: boolean
        authorizeVoters: boolean
    } | null
}

interface CategoryInfo {
    id: string
    name: string
}

interface VoterSessionPortalProps {
    election: ElectionInfo
    category: CategoryInfo | null
    accessCode: string
}

export function VoterSessionPortal({
    election,
    category,
    accessCode,
}: VoterSessionPortalProps) {
    const router = useRouter()

    // Dialog states
    const [isIdDialogOpen, setIsIdDialogOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isPausedDialogOpen, setIsPausedDialogOpen] = useState(false)
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)

    // Voting states
    const [isVoting, setIsVoting] = useState(false)
    const [isBallotSubmitted, setIsBallotSubmitted] = useState(false)
    const [isSubmittingBallot, setIsSubmittingBallot] = useState(false)
    const [hasConfirmedIdentity, setHasConfirmedIdentity] = useState(false)
    const [verificationError, setVerificationError] = useState<string | null>(null)
    const [voterData, setVoterData] = useState<VoterData | null>(null)
    const [ballotElection, setBallotElection] = useState<BallotElection | null>(null)
    const [lastUsedId, setLastUsedId] = useState("")

    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof voterIdSchema>>({
        resolver: zodResolver(voterIdSchema),
        defaultValues: { uniqueId: "" },
    })

    // Welcome toast (once on mount)
    const toastShown = useRef(false)
    useEffect(() => {
        if (!toastShown.current) {
            toast.info("Secure Session Started", {
                description: "Your Voter ID will be required to open the ballot.",
                duration: 4000,
            })
            toastShown.current = true
        }
    }, [])

    // Fullscreen guard — if voter exits fullscreen during an active session, reset
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = Boolean(document.fullscreenElement)
            if (!isFullscreen && (isIdDialogOpen || isConfirmDialogOpen || isPausedDialogOpen || isVoting)) {
                setIsIdDialogOpen(false)
                setIsConfirmDialogOpen(false)
                setIsPausedDialogOpen(false)
                setIsVoting(false)
                toast.warning("Fullscreen mode was exited. Please re-enter fullscreen to continue voting.")
            }
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [isIdDialogOpen, isConfirmDialogOpen, isPausedDialogOpen, isVoting])

    // ── Handlers ────────────────────────────────────────────────────────────

    const resetVoterSession = () => {
        setVoterData(null)
        setBallotElection(null)
        setHasConfirmedIdentity(false)
        setLastUsedId("")
        form.reset()
    }

    const handleStartAction = () => {
        const elem = document.documentElement
        if (!document.fullscreenElement && elem.requestFullscreen) {
            elem.requestFullscreen()
                .then(() => {
                    form.reset()
                    setIsIdDialogOpen(true)
                })
                .catch(() => {
                    toast.error("Fullscreen mode is required to vote. Please allow it and try again.")
                })
            return
        }
        form.reset()
        setIsIdDialogOpen(true)
    }

    const handleIdDialogOpenChange = (open: boolean) => {
        setIsIdDialogOpen(open)
        if (!open) setVerificationError(null)
    }

    const verifyVoter = (uniqueId: string) => {
        setVerificationError(null)
        setLastUsedId(uniqueId)
        startTransition(async () => {
            const result = await verifyVoterUniqueIdAction(election.id, uniqueId, category?.id)

            if ("error" in result) {
                if (result.status === "PAUSED") {
                    setIsIdDialogOpen(false)
                    setIsPausedDialogOpen(true)
                } else {
                    setVerificationError(result.error)
                }
                return
            }

            setVoterData(result.voter)
            setBallotElection(result.ballot)
            setHasConfirmedIdentity(false)
            setIsIdDialogOpen(false)
            setIsPausedDialogOpen(false)
            setIsConfirmDialogOpen(true)
        })
    }

    const onIdSubmit = (values: z.infer<typeof voterIdSchema>) => {
        verifyVoter(values.uniqueId)
    }

    const handleRetryVerification = () => {
        if (lastUsedId) verifyVoter(lastUsedId)
    }

    const handleStartVoting = () => {
        if (!hasConfirmedIdentity || !ballotElection) return
        toast.success("Identity Verified", {
            description: `Welcome, ${voterData?.name}. Your ballot is ready.`,
            duration: 3000,
        })
        setIsConfirmDialogOpen(false)
        setIsVoting(true)
    }

    const handleChangeId = () => {
        setHasConfirmedIdentity(false)
        setIsConfirmDialogOpen(false)
        setBallotElection(null)
        setIsIdDialogOpen(true)
    }

    const handleCancelBallot = () => {
        setIsVoting(false)
        resetVoterSession()
        toast.info("Ballot cancelled. No vote was submitted.")
    }

    const handleSubmitBallot = async (votes: Record<string, string>) => {
        if (!voterData) return
        setIsSubmittingBallot(true)
        try {
            const result = await submitBallotAction(election.id, voterData.id, votes, category?.id)
            if ("error" in result) {
                if (result.status === "PAUSED") {
                    setIsSubmittingBallot(false)
                    setIsVoting(false)
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
            resetVoterSession()
        } catch {
            toast.error("Failed to submit ballot. Please try again.")
            setIsSubmittingBallot(false)
        }
    }

    const handleExitClick = () => setIsExitDialogOpen(true)

    const handleConfirmExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {})
        }
        setIsVoting(false)
        setIsBallotSubmitted(false)
        resetVoterSession()
        toast.info("Session concluded. You have exited the election portal.")
        router.push("/auth/vote")
    }

    const handleReturnToLobby = () => {
        setIsBallotSubmitted(false)
        resetVoterSession()
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20">
            {/* Background ambient glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
                <div className="absolute -bottom-1/4 -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] animate-pulse [animation-delay:1s]" />
            </div>

            {/* Ripple pattern */}
            <div
                className="absolute inset-0 opacity-50 dark:opacity-30 pointer-events-none"
                style={{
                    maskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 140% 100% at 50% 50%, black 0%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                }}
            >
                <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
            </div>

            {/* Fade overlay */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-background/20 to-background/80" />

            {/* Top-right controls (hidden during active voting) */}
            <div
                className={cn(
                    "absolute top-4 right-4 z-50 flex items-center gap-2 transition-opacity duration-300",
                    isVoting ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitClick}
                    className="text-destructive border-destructive/20 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                    Exit
                </Button>
                <div className="w-px h-4 bg-border/40" />
                <ThemeSwitch />
            </div>

            {/* ── Ballot Submitted Screen ──────────────────────────────── */}
            {!isVoting && isBallotSubmitted && (
                <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
                            Ballot Submitted
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                            Thank you for voting
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                            Your ballot for <span className="font-semibold text-foreground">{election.name}</span> has been recorded. You may now leave this device.
                        </p>
                    </div>
                    <div className="w-full max-w-sm grid gap-3 sm:grid-cols-2">
                        <Button variant="outline" size="lg" onClick={handleReturnToLobby}>
                            Return to Election
                        </Button>
                        <Button
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-500"
                            onClick={handleExitClick}
                        >
                            Leave Portal
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Lobby / Entry Screen ─────────────────────────────────── */}
            {!isVoting && !isBallotSubmitted && (
                <div className="max-w-4xl w-full flex flex-col items-center space-y-14 z-10 -mt-16 animate-in fade-in duration-500">
                    {/* Org logo */}
                    {election.organization.logo && election.organization.settings?.allowCustomBranding && (
                        <div className="relative w-full max-w-[380px] md:max-w-[500px] aspect-[2258/476]">
                            <Image
                                src={election.organization.logo}
                                alt={election.organization.name}
                                fill
                                className={cn(
                                    "object-contain transition-all duration-300",
                                    election.organization.logo.toLowerCase().endsWith(".svg") &&
                                        "brightness-0 dark:invert"
                                )}
                                priority
                            />
                        </div>
                    )}

                    {/* Election info */}
                    <div className="text-center space-y-4">
                        {/* Live badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold tracking-[0.2em] uppercase">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                            </span>
                            Live Election
                            {category && (
                                <>
                                    <span className="opacity-40">·</span>
                                    <Badge variant="secondary" className="text-[10px] font-bold h-4 px-1.5 rounded-full">
                                        {category.name}
                                    </Badge>
                                </>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight break-words max-w-2xl mx-auto">
                            {election.name}
                        </h1>

                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <HugeiconsIcon icon={Building03Icon} className="w-4 h-4 shrink-0" />
                            <span className="font-medium">{election.organization.name}</span>
                        </div>

                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm mx-auto font-medium">
                            Keep your Voter ID ready. Your identity will be verified before the ballot opens.
                        </p>
                    </div>

                    {/* Start button */}
                    <Button
                        size="lg"
                        className="h-12 px-10 rounded-xl text-base font-bold shadow-lg shadow-emerald-500/15 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/20 transition-all duration-300 active:scale-[0.98]"
                        onClick={handleStartAction}
                    >
                        <HugeiconsIcon icon={PlayIcon} className="w-5 h-5 fill-current" />
                        Start Voting
                    </Button>
                </div>
            )}

            {/* ── Ballot Interface (overlays entire screen) ───────────── */}
            {isVoting && voterData && ballotElection && (
                <div className="absolute inset-0 overflow-y-auto z-20 bg-background animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <BallotInterface
                        election={ballotElection}
                        voterData={voterData}
                        onSubmitBallot={handleSubmitBallot}
                        onBack={handleCancelBallot}
                        isSubmitting={isSubmittingBallot}
                    />
                </div>
            )}

            {/* ── Dialogs ─────────────────────────────────────────────── */}
            <VoterIdDialog
                open={isIdDialogOpen}
                onOpenChange={handleIdDialogOpenChange}
                form={form}
                onSubmit={onIdSubmit}
                isPending={isPending}
                verificationError={verificationError}
            />

            <VoterConfirmDialog
                open={isConfirmDialogOpen && !isVoting}
                onOpenChange={setIsConfirmDialogOpen}
                voterData={voterData}
                hasConfirmed={hasConfirmedIdentity}
                onConfirmChange={setHasConfirmedIdentity}
                onStartVoting={handleStartVoting}
                onChangeId={handleChangeId}
            />

            <VoterPausedDialog
                open={isPausedDialogOpen}
                onOpenChange={setIsPausedDialogOpen}
                onRetry={handleRetryVerification}
                onExit={handleConfirmExit}
                isPending={isPending}
            />

            <VoterExitDialog
                open={isExitDialogOpen}
                onOpenChange={setIsExitDialogOpen}
                onConfirm={handleConfirmExit}
            />
        </div>
    )
}
