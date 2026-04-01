"use client"

import Link from "next/link"
import React, { useState, useEffect, useTransition, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Mail01Icon,
    Alert01Icon,
    CheckmarkCircle01Icon,
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
    InputOTPSeparator
} from "@/components/ui/input-otp"
import { verifyEmail, resendVerificationCode } from "@/lib/actions/auth-actions"
import { signOut } from "next-auth/react"

const RESEND_COOLDOWN = 30 // seconds

export default function VerifyEmailPage() {
    const { data: session, update } = useSession()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get("email")
    const nextParam = searchParams.get("next")

    const displayEmail = session?.user?.email || emailParam

    const [otp, setOtp] = useState("")
    const [isPending, startTransition] = useTransition()
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendTimer, setResendTimer] = useState(searchParams.get("resend") === "true" ? 0 : RESEND_COOLDOWN)
    const router = useRouter()
    const autoResendTriggered = useRef(false)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [resendTimer])


    const handleVerify = async (value: string) => {
        if (value.length !== 6) return

        setError(null)
        startTransition(async () => {
            try {
                const result = await verifyEmail(value, emailParam || undefined)

                if (!result.success) {
                    setError(result.error || "Invalid code")
                    setOtp("") // Clear on error
                    return
                }

                // Instead of showing a local success alert, we redirect to login immediately
                if (session) {
                    await update()
                    await signOut({ redirect: false })
                }

                const loginUrl = nextParam
                    ? `/auth/login?next=${encodeURIComponent(nextParam)}&verified=true`
                    : '/auth/login?verified=true'

                // Show the toast here so it's guaranteed to show during transition
                toast.success("Account verified! Please log in.")

                // Immediate redirect
                router.push(loginUrl)
                router.refresh()
            } catch (err) {
                setError("An unexpected error occurred. Please try again.")
            }
        })
    }

    const handleResend = async () => {
        if (resendTimer > 0 || isResending) return

        setIsResending(true)
        setError(null)
        try {
            const result = await resendVerificationCode(emailParam || undefined)
            if (result.success) {
                setResendTimer(RESEND_COOLDOWN)
            } else {
                setError(result.error || "Failed to resend code")
            }
        } catch (err) {
            setError("Failed to resend code. Please try again.")
        } finally {
            setIsResending(false)
        }
    }

    // Auto-trigger resend if redirected from middleware (email not yet verified)
    useEffect(() => {
        const shouldAutoResend = searchParams.get("resend") === "true" &&
            !autoResendTriggered.current &&
            (session?.user ? !session.user.emailVerified : !!emailParam)

        if (shouldAutoResend) {
            autoResendTriggered.current = true
            handleResend()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount only

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
                        <Alert variant="destructive" className="flex items-center text-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl w-full">
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
                            disabled={isPending}
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
                            disabled={otp.length !== 6 || isPending}
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
                                <Spinner className="w-3 h-3" />
                            ) : resendTimer > 0 ? (
                                <span>Try again in {resendTimer}s</span>
                            ) : (
                                "Resend code"
                            )}
                        </Button>
                    </div>
                </CardFooter>
        </Card>
    )
}
