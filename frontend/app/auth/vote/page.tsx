"use client"

import { toast } from "sonner"
import React, { useState, useTransition } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Ticket01Icon, Alert01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VoteSchema } from "@/lib/schemas/auth"
import { z } from "zod"
import { validateElectionCodeAction } from "@/lib/actions/vote-actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

function VoteForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
    const [electionInfo, setElectionInfo] = useState<{ id: string, name: string, code: string } | null>(null)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof VoteSchema>>({
        resolver: zodResolver(VoteSchema),
        defaultValues: {
            code: "",
        }
    })

    const onSubmit = (values: z.infer<typeof VoteSchema>) => {
        setError(null)
        startTransition(async () => {
            const result = await validateElectionCodeAction(values.code)

            if (result.error) {
                setError(result.error)
                return
            }

            if (result.success && result.electionId && result.name) {
                setElectionInfo({ id: result.electionId, name: result.name, code: values.code.toUpperCase() })
                setIsDisclaimerOpen(true)
            }
        })
    }

    // Reset disclaimer state when dialog is closed
    React.useEffect(() => {
        if (!isDisclaimerOpen) {
            setHasAcceptedDisclaimer(false)
        }
    }, [isDisclaimerOpen])

    const handleContinue = () => {
        if (!hasAcceptedDisclaimer || !electionInfo) return

        // Attempt to enter fullscreen immediately on this gesture
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn("Fullscreen request rejected on transition:", err)
            })
        }

        setIsRedirecting(true)
        router.push(`/vote/${electionInfo.code}`)
    }

    return (
        <>
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={Ticket01Icon} className="w-8 h-8" strokeWidth={2} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Cast Your Vote</CardTitle>
                    <CardDescription>Enter your unique election access code to begin.</CardDescription>
                </CardHeader>

                <CardContent className="px-0 space-y-4 md:px-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive mb-1" />
                                <AlertDescription className="text-destructive">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Field>
                            <FieldLabel htmlFor="code">Election Access Code</FieldLabel>
                            <Input
                                id="code"
                                placeholder="e.g. ELEC-1234-ABCD"
                                disabled={isPending}
                                {...register("code")}
                            />
                            <FieldError errors={[{ message: errors.code?.message }]} />
                        </Field>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Spinner />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    Join Election
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center border-t border-border/50 pb-6 px-0 md:px-6 pt-6 gap-2">
                    <p className="text-sm text-muted-foreground font-medium">
                        Need help finding your code?
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Please contact your election authority or administrator.
                    </p>
                </CardFooter>
            </Card>

            <Dialog open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
                <DialogContent
                    className="sm:max-w-md bg-card/95 backdrop-blur-md border shadow-2xl"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader className="space-y-3">
                        <div className="flex items-center gap-3 text-primary mb-1">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5" />
                            </div>
                            <DialogTitle className="text-xl font-bold">Session Information</DialogTitle>
                        </div>
                        <DialogDescription asChild>
                            <div className="text-foreground/80 leading-relaxed space-y-4">
                                <p>You are about to enter the voting session for:</p>
                                <div className="p-4 rounded-xl bg-muted/50 border flex items-center justify-center">
                                    <span className="text-lg font-bold text-foreground text-center">{electionInfo?.name}</span>
                                </div>
                                <div className="space-y-3 text-[13px]">
                                    <p className="font-medium text-amber-600 dark:text-amber-400">Important Disclaimer:</p>
                                    <p>
                                        Any configuration changes made to the election dashboard (e.g., adding candidates, updating roles, or modifying settings) while you are in this session will not be reflected immediately.
                                    </p>
                                    <p className="italic text-muted-foreground">
                                        To receive the latest updates, you must exit and re-enter the election portal (except when the election is paused).
                                    </p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex items-start space-x-3 p-4 rounded-xl border bg-primary/5 select-none cursor-pointer group hover:bg-primary/10 transition-colors"
                            onClick={() => setHasAcceptedDisclaimer(!hasAcceptedDisclaimer)}>
                            <div className="pt-0.5">
                                <Checkbox
                                    id="disclaimer"
                                    checked={hasAcceptedDisclaimer}
                                    onCheckedChange={(checked) => setHasAcceptedDisclaimer(!!checked)}
                                    className="h-5 w-5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                                />
                            </div>
                            <p
                                className="text-sm font-medium leading-tight cursor-pointer text-primary transition-colors"
                            >
                                I have read this message and I&apos;m ready to proceed with the election.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDisclaimerOpen(false)}
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
                                    Proceeding...
                                </>
                            ) : (
                                <>
                                    Proceed
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
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
        <VotePageContent />
    )
}

function VotePageContent() {
    return (
        <VoteForm />
    )
}
