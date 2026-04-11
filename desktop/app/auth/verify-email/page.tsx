"use client"

import Link from "next/link"
import React, { useState, useEffect, useTransition, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Mail01Icon,
    Alert01Icon,
    PencilEdit02Icon
} from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from "@/components/providers/auth-provider"
import { api } from "@/lib/api"

import { Suspense } from "react"

const RESEND_COOLDOWN = 30 // seconds

function VerifyEmailForm() {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get("email")
    const nextParam = searchParams.get("next")

    const displayEmail = user?.email || emailParam

    const [otp, setOtp] = useState("")
    const [isPending, startTransition] = useTransition()
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendTimer, setResendTimer] = useState(searchParams.get("resend") === "true" ? 0 : RESEND_COOLDOWN)
    const [isLockedOut, setIsLockedOut] = useState(false)
    const router = useRouter()
    const autoResendTriggered = useRef(false)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setIsLockedOut(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [resendTimer])

    const handleVerify = async (value: string) => {
        if (value.length !== 6 || isLockedOut) return

        setError(null)
        startTransition(async () => {
            try {
                await api.post("/auth/verify-email", {
                    code: value,
                    email: displayEmail
                })

                const loginUrl = nextParam
                    ? `/auth/login?next=${encodeURIComponent(nextParam)}&verified=true`
                    : '/auth/login?verified=true'

                toast.success("Account verified successfully!")
                router.push(loginUrl)
            } catch (err: any) {
                const message = err.detail || "Verification failed"
                setError(message)

                if (err.status === 429) {
                    setIsLockedOut(true)
                    // Try to parse minutes from backend message (e.g., "... in 12 minutes.")
                    const match = err.detail?.match(/(\d+)\s+minutes/)
                    const minutes = match ? parseInt(match[1]) : 15
                    setResendTimer(minutes * 60)
                }

                setOtp("") // Clear on error to allow retry
            }
        })
    }

    const handleResend = async () => {
        if (resendTimer > 0 || isResending || isLockedOut) return

        setIsResending(true)
        setError(null)
        try {
            await api.post("/auth/resend-verification", {
                email: displayEmail
            })
            setResendTimer(RESEND_COOLDOWN)
            const [localPart, domain] = (displayEmail || "").split("@")
            const maskedEmail = localPart.length > 2
                ? `${localPart.substring(0, 2)}*****${localPart.substring(localPart.length - 2)}@${domain}`
                : displayEmail
            toast.info(`Verification code sent to ${maskedEmail}`)
        } catch (err: any) {
            const message = err.detail || "Failed to resend code"
            setError(message)

            if (err.status === 429) {
                setIsLockedOut(true)
                const match = err.detail?.match(/(\d+)\s+minutes/)
                const minutes = match ? parseInt(match[1]) : 15
                setResendTimer(minutes * 60)
            } else {
                toast.error("Resend failed")
            }
        } finally {
            setIsResending(false)
        }
    }

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        const shouldAutoResend = searchParams.get("resend") === "true" &&
            !autoResendTriggered.current &&
            (user ? !user.emailVerified : !!emailParam)

        if (shouldAutoResend) {
            autoResendTriggered.current = true
            handleResend()
        }
    }, [])

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6 space-y-2">
                <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <HugeiconsIcon icon={Mail01Icon} className="w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Verify your email</CardTitle>
                <CardDescription>
                    We've sent a 6-digit verification code to
                </CardDescription>

                <div className="flex justify-center">
                    <Badge variant="outline" className="rounded-full py-1.5 px-3 h-auto text-sm font-medium border-border/50 bg-muted/50">
                        <span className="leading-none">{displayEmail}</span>
                        <Link
                            href={`/auth/signup${displayEmail ? `?email=${encodeURIComponent(displayEmail)}` : ''}`}
                            className="ml-1 text-muted-foreground hover:text-primary transition-colors hover:bg-background rounded-sm p-0.5"
                            title="Edit email address"
                        >
                            <HugeiconsIcon icon={PencilEdit02Icon} className="w-3.5 h-3.5" />
                        </Link>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-0 md:px-6 pb-2">
                <div className="max-w-sm mx-auto space-y-6 flex flex-col items-center w-full">
                    {error && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 text-destructive mb-1" />
                            <AlertDescription className="text-destructive">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col items-center space-y-8 w-full">
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            pattern={REGEXP_ONLY_DIGITS}
                            onComplete={handleVerify}
                            disabled={isPending || isLockedOut}
                            autoFocus
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="size-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                                <InputOTPSlot index={1} className="size-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                                <InputOTPSlot index={2} className="size-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                                <InputOTPSlot index={3} className="size-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                                <InputOTPSlot index={4} className="size-12 text-lg" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                                <InputOTPSlot index={5} className="size-12 text-lg" />
                            </InputOTPGroup>
                        </InputOTP>

                        <Button
                            onClick={() => handleVerify(otp)}
                            className="w-full"
                            disabled={otp.length !== 6 || isPending || isLockedOut}
                        >
                            {isPending && <Spinner className="w-4 h-4 mr-2 text-white" />}
                            Verify Account
                        </Button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="opacity-80">Didn't receive the code?</span>
                    <Button
                        onClick={handleResend}
                        variant={"link"}
                        disabled={resendTimer > 0 || isResending}
                        className="text-primary font-semibold hover:underline disabled:no-underline disabled:opacity-50 transition-colors -ml-2"
                    >
                        {isResending ? (
                            <span className="flex flex-row items-center gap-2">
                                <Spinner className="w-3 h-3" />
                                Sending...
                            </span>
                        ) : resendTimer > 0 ? (
                            <span>Try again in {formatTime(resendTimer)}</span>
                        ) : (
                            "Resend code"
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Spinner /></div>}>
            <VerifyEmailForm />
        </Suspense>
    )
}
