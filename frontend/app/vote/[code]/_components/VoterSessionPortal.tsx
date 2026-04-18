"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from '@hugeicons/react'
import { PlayIcon, Logout01Icon } from '@hugeicons/core-free-icons'
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

import { BallotInterface } from "./BallotInterface"

interface VoterSessionPortalProps {
    election: any
}

export function VoterSessionPortal({ election }: VoterSessionPortalProps) {
    const router = useRouter()
    const { setTheme } = useTheme()
    const previousThemeRef = useRef<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isIdDialogOpen, setIsIdDialogOpen] = useState(false)
    const [isVoterInfoDialogOpen, setIsVoterInfoDialogOpen] = useState(false)
    const [isPausedDialogOpen, setIsPausedDialogOpen] = useState(false)
    const [isVoting, setIsVoting] = useState(false)
    const [isSubmittingBallot, setIsSubmittingBallot] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [voterData, setVoterData] = useState<any>(null)
    const [lastUsedId, setLastUsedId] = useState("")
    const [hasConfirmedIdentity, setHasConfirmedIdentity] = useState(false)
    const [verificationError, setVerificationError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof VoterIdSchema>>({
        resolver: zodResolver(VoterIdSchema),
        defaultValues: { uniqueId: "" }
    })

    // Force light theme on mount, restore on unmount
    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        previousThemeRef.current = currentTheme
        setTheme('light')
        return () => {
            if (previousThemeRef.current) {
                setTheme(previousThemeRef.current)
            }
        }
    }, [])

    // Monitor fullscreen status
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    // Strict mode: close dialogs if fullscreen exited
    useEffect(() => {
        if (!isFullscreen && (isIdDialogOpen || isVoterInfoDialogOpen || isPausedDialogOpen || isVoting)) {
            setIsIdDialogOpen(false)
            setIsVoterInfoDialogOpen(false)
            setIsPausedDialogOpen(false)
            setIsVoting(false) // Dump out of ballot if they exit
            toast.warning("Secure session interrupted. Please re-enable fullscreen to continue.")
        }
    }, [isFullscreen])

    const handleExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { })
        }
        router.push("/auth/vote")
    }

    const handleStartAction = () => {
        if (!document.fullscreenElement) {
            const elem = document.documentElement
            if (elem.requestFullscreen) {
                elem.requestFullscreen().then(() => {
                    form.reset()
                    setIsIdDialogOpen(true)
                }).catch(() => {
                    toast.error("Secure mode is required. Please enable fullscreen to continue.")
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
        if (!hasConfirmedIdentity) return
        toast.success("Identity confirmed. Loading ballot...")
        setIsVoterInfoDialogOpen(false)
        setIsVoting(true)
    }

    const handleChangeId = () => {
        setIsVoterInfoDialogOpen(false)
        setIsIdDialogOpen(true)
    }

    const handleSubmitBallot = async (votes: Record<string, string>) => {
        if (!voterData) return

        setIsSubmittingBallot(true)
        try {
            const result = await submitBallotAction(election.id, voterData.id, votes)
            
            if (result.error) {
                toast.error(result.error)
                setIsSubmittingBallot(false)
                return
            }

            toast.success("Ballot submitted successfully!")
            
            // Wait slightly before exiting the screen
            setTimeout(() => {
                setIsSubmittingBallot(false)
                setIsVoting(false)
                setVoterData(null)
                setHasConfirmedIdentity(false)
                setLastUsedId("")
                form.reset()
            }, 1000)
            
        } catch (error) {
            toast.error("Failed to submit ballot. Please try again.")
            setIsSubmittingBallot(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-background to-primary/5 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ripple Background Effect */}
            <div className="absolute inset-0 opacity-80 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        maskImage: "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    }}
                >
                    <BackgroundRippleEffect rows={12} cols={24} cellSize={60} />
                </div>
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 opacity-60" />

            {/* Exit Button - Top Right */}
            <div className={`absolute top-4 right-4 z-50 transition-opacity duration-300 ${isVoting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExit}
                    className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 transition-colors hover:text-destructive"
                >
                    <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                    Exit
                </Button>
            </div>

            {/* Main Content - Entry Screen */}
            {!isVoting && (
                <div className="max-w-4xl w-full flex flex-col items-center space-y-16 z-10 -mt-24 transition-all duration-500">
                    {/* Organization Logo - Clean & Integrated */}
                    {election.organization.logo && (
                        <div className="relative w-full max-w-[400px] md:max-w-[550px] aspect-[2258/476]">
                            <Image
                                src={election.organization.logo}
                                alt={election.organization.name}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    )}

                    {/* Election Information */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Election Session
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                            {election.name}
                        </h1>
                        <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed font-medium">
                            This is a secure, monitored environment. Ensure you have your unique voter identification ready.
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
            {isVoting && voterData && (
                <div className="absolute inset-0 overflow-y-auto no-scrollbar z-20 px-4 py-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BallotInterface 
                        election={election} 
                        voterData={voterData} 
                        onSubmitBallot={handleSubmitBallot}
                        isSubmitting={isSubmittingBallot}
                    />
                </div>
            )}

            {/* Voter ID Dialog */}
            <VoterIdDialog
                open={isIdDialogOpen}
                onOpenChange={setIsIdDialogOpen}
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
                onExit={handleExit}
                isPending={isPending}
            />
        </div>
    )
}
