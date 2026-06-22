"use client"

import React, { useState, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    Ticket01Icon,
    Alert01Icon,
    ArrowRight01Icon,
    InformationCircleIcon,
    CheckmarkCircle01Icon,
    Building03Icon,
} from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldError,
    FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { validateElectionCodeAction, prefetchBallotDataAction } from "@/lib/actions/vote-actions"
import { voteSchema } from "@/lib/schemas/auth"
import { DeviceGuard } from "@/app/vote/_components/DeviceGuard"

import { useSession } from "@/lib/auth-client"

type VoteFormValues = z.infer<typeof voteSchema>

interface ElectionInfo {
    electionId: string
    name: string
    code: string
    categoryId?: string
    categoryName?: string
    settings?: {
        authorizeVoters: boolean
        showSummary: boolean
        quickElection: boolean
    }
}

function VoteForm() {
    const router = useRouter()
    const { data: session } = useSession()
    const isAdminLoggedIn = !!session

    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
    const [electionInfo, setElectionInfo] = useState<ElectionInfo | null>(null)

    const form = useForm<VoteFormValues>({
        resolver: zodResolver(voteSchema),
        defaultValues: { code: "" },
    })

    // Reset disclaimer acceptance when dialog closes
    React.useEffect(() => {
        if (!isDisclaimerOpen) {
            setHasAcceptedDisclaimer(false)
        }
    }, [isDisclaimerOpen])

    const onSubmit = (values: VoteFormValues) => {
        if (isAdminLoggedIn) return
        setError(null)
        startTransition(async () => {
            const result = await validateElectionCodeAction(values.code)
            if ("error" in result) {
                setError(result.error)
                return
            }
            setElectionInfo({
                electionId: result.electionId,
                name: result.name,
                code: result.code,
                categoryId: result.categoryId,
                categoryName: result.categoryName,
                settings: result.settings,
            })
            setIsDisclaimerOpen(true)
        })
    }

    const handleContinue = () => {
        if (!hasAcceptedDisclaimer || !electionInfo || isAdminLoggedIn) return

        setIsRedirecting(true)

        // Pre-fetch ballot data and cache it in sessionStorage
        startTransition(async () => {
            const prefetch = await prefetchBallotDataAction(electionInfo.electionId, electionInfo.categoryId)
            if ("success" in prefetch) {
                try {
                    sessionStorage.setItem(`ballot_cache_${electionInfo.electionId}`, JSON.stringify({
                        ballot: prefetch.ballot,
                        updatedAt: prefetch.updatedAt,
                        cachedAt: new Date().toISOString()
                    }))
                } catch (e) {
                    console.warn("Failed to cache ballot data:", e)
                }
            }

            // Request fullscreen on this user-gesture
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((err) => {
                    console.warn("Fullscreen request rejected:", err)
                })
            }

            // Redirect using the ID (election or category) — not the human-readable code.
            // This hides the access code from the browser URL for security.
            const redirectId = electionInfo.categoryId ?? electionInfo.electionId
            router.push(`/vote/${redirectId}`)
        })
    }

    return (
        <>
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={Ticket01Icon} className="w-7 h-7" strokeWidth={2} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Cast Your Vote</CardTitle>
                    <CardDescription>
                        Enter your election access code to begin the secure voting process.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0 space-y-4 md:px-6">
                    {isAdminLoggedIn && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                            <AlertDescription>
                                You cannot vote while logged in as an admin/staff. Please log out from dashboard.
                            </AlertDescription>
                        </Alert>
                    )}
                    {error && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field data-invalid={!!form.formState.errors.code}>
                                <FieldLabel htmlFor="code">Election Access Code</FieldLabel>
                                <Input
                                    id="code"
                                    placeholder="e.g. ELEC-1234"
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    disabled={isPending || isAdminLoggedIn}
                                    {...form.register("code")}
                                />
                                <FieldDescription>
                                    Your code was provided by your organization's election administrator.
                                </FieldDescription>
                                {form.formState.errors.code && (
                                    <FieldError>{form.formState.errors.code.message}</FieldError>
                                )}
                            </Field>
                        </FieldGroup>

                        <Button
                            type="submit"
                            className="w-full gap-2 mt-5"
                            disabled={isPending || isAdminLoggedIn}
                        >
                            {isPending ? (
                                <>
                                    <Spinner />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    Join Election
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center border-t border-border/50 pt-4 pb-2 px-0 md:px-6 gap-1.5">
                    <p className="text-sm text-muted-foreground font-medium">
                        Can't find your access code?
                    </p>
                    <p className="text-xs text-muted-foreground/70 text-center">
                        Contact your election authority or organization administrator.
                    </p>
                </CardFooter>
            </Card>

            {/* Disclaimer Dialog */}
            <Dialog open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
                <DialogContent
                    showCloseButton={false}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    className="sm:max-w-lg"
                >
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                                <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-lg font-bold">Before You Begin</DialogTitle>
                        </div>
                        <DialogDescription asChild>
                            <div className="space-y-4 text-foreground/80 leading-relaxed">
                                <p className="text-sm">You are about to enter the secure voting session for:</p>

                                {/* Election Info Card */}
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
                                    <div className="flex items-start gap-2">
                                        <HugeiconsIcon icon={Building03Icon} className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                                        <span className="text-base font-bold text-foreground break-words leading-tight">
                                            {electionInfo?.name}
                                        </span>
                                    </div>
                                    {electionInfo?.categoryName && (
                                        <div className="pl-6">
                                            <Badge variant="secondary" className="text-xs">
                                                {electionInfo.categoryName}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 text-[13px]">
                                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                                        Important:
                                    </p>
                                    <ul className="space-y-1.5 text-muted-foreground">
                                        {electionInfo?.settings?.authorizeVoters !== false ? (
                                            <li>• Your ballot opens only after your Voter ID is verified.</li>
                                        ) : (
                                            <li>• This is an anonymous election. Your ballot will open immediately.</li>
                                        )}
                                        <li>• Please vote in <span className="font-medium text-foreground">fullscreen mode</span> — exiting fullscreen will interrupt your session.</li>
                                        {electionInfo?.settings?.showSummary !== false && electionInfo?.settings?.quickElection !== true ? (
                                            <li>• Review your selections carefully before final submission. <span className="font-medium text-foreground">Votes cannot be changed</span> once cast.</li>
                                        ) : (
                                            <li>• Be careful! You will not be able to review your votes before submission. <span className="font-medium text-foreground">Votes are cast instantly</span>.</li>
                                        )}
                                        <li>• <span className="font-medium text-foreground">Desktop/Laptop Required:</span> Voting is not available on mobile phones or tablets.</li>
                                        <li>• Ballot data is <span className="font-medium text-foreground">cached locally</span> for a faster experience. If any changes need to be reflected, exit and re-enter the vote.</li>
                                    </ul>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Consent checkbox */}
                    <div
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 group ${hasAcceptedDisclaimer
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted/40 border-border hover:bg-muted/60 hover:border-muted-foreground/20"
                            }`}
                        onClick={() => setHasAcceptedDisclaimer(!hasAcceptedDisclaimer)}
                    >
                        <div className="pt-0.5">
                            <Checkbox
                                id="disclaimer"
                                checked={hasAcceptedDisclaimer}
                                onCheckedChange={(checked) => setHasAcceptedDisclaimer(!!checked)}
                                className="h-5 w-5"
                            />
                        </div>
                        <p
                            className={`text-sm font-medium leading-snug cursor-pointer transition-colors ${hasAcceptedDisclaimer
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                                }`}
                        >
                            I understand the above and I'm ready to proceed.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDisclaimerOpen(false)}
                            disabled={isRedirecting}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!hasAcceptedDisclaimer || isRedirecting}
                            onClick={handleContinue}
                        >
                            {isRedirecting ? (
                                <>
                                    <Spinner />
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />
                                    Proceed to Vote
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function VotePage() {
    return (
        <DeviceGuard>
            <div className="w-full">
                <VoteForm />
            </div>
        </DeviceGuard>
    )
}
