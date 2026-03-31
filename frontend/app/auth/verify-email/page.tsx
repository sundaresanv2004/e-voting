"use client"

import Link from "next/link"
import React, { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Mail01Icon, 
  LeftToRightListNumberIcon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  RefreshIcon,
  PencilEdit02Icon
} from '@hugeicons/core-free-icons'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { verifyEmail, resendVerificationCode } from "@/lib/actions/auth-actions"
import { signOut } from "next-auth/react"

const RESEND_COOLDOWN = 60 // seconds

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
    const [success, setSuccess] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const router = useRouter()

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

                setSuccess(true)
                
                // If they are logged in, update the session. 
                // However, the user wants to go to /auth/login after verification.
                // To avoid redirection loops, we'll sign them out if they are logged in, 
                // so they see the login page as requested.
                if (session) {
                    await update()
                    await signOut({ redirect: false })
                }
                
                const loginUrl = nextParam 
                    ? `/auth/login?next=${encodeURIComponent(nextParam)}&verified=true`
                    : '/auth/login?verified=true'

                setTimeout(() => {
                    router.push(loginUrl)
                    router.refresh()
                }, 2000)
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 overflow-hidden">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6 space-y-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={Mail01Icon} className="w-8 h-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Verify your email</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        We've sent a 6-digit verification code to
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mt-2 bg-muted/50 py-1.5 px-3 rounded-md w-fit mx-auto border border-border/50">
                        <span className="font-medium text-foreground text-sm">{displayEmail}</span>
                        <Link 
                            href={`/auth/signup${displayEmail ? `?email=${encodeURIComponent(displayEmail)}` : ''}`}
                            className="text-muted-foreground hover:text-primary transition-colors hover:bg-background rounded-sm p-0.5"
                            title="Edit email address"
                        >
                            <HugeiconsIcon icon={PencilEdit02Icon} className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </CardHeader>

                <CardContent className="px-0 md:px-6 pb-2 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full"
                            >
                                <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full"
                            >
                                <Alert className="bg-primary/10 border-primary/20">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-primary" />
                                    <AlertTitle className="text-primary font-semibold">Verified!</AlertTitle>
                                    <AlertDescription className="text-primary/80">
                                        Your email has been successfully verified. Redirecting...
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!success && (
                        <div className="flex flex-col items-center space-y-4 w-full mt-4">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                onComplete={handleVerify}
                                disabled={isPending}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="size-12 sm:size-14 text-lg" />
                                    <InputOTPSlot index={1} className="size-12 sm:size-14 text-lg" />
                                    <InputOTPSlot index={2} className="size-12 sm:size-14 text-lg" />
                                    <InputOTPSlot index={3} className="size-12 sm:size-14 text-lg" />
                                    <InputOTPSlot index={4} className="size-12 sm:size-14 text-lg" />
                                    <InputOTPSlot index={5} className="size-12 sm:size-14 text-lg" />
                                </InputOTPGroup>
                            </InputOTP>

                            <Button 
                                onClick={() => handleVerify(otp)}
                                className="w-full mt-2"
                                disabled={otp.length !== 6 || isPending}
                            >
                                {isPending && <Spinner className="w-4 h-4 mr-2" />}
                                Verify Account
                            </Button>
                        </div>
                    )}
                </CardContent>

                {!success && (
                    <CardFooter className="flex justify-center pt-2 pb-4 px-0 md:px-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="opacity-80">Didn't receive the code?</span>
                            <button 
                                onClick={handleResend}
                                disabled={resendTimer > 0 || isResending}
                                className="text-primary font-medium hover:text-primary/80 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                            >
                                {isResending ? (
                                    <Spinner className="w-3 h-3" />
                                ) : resendTimer > 0 ? (
                                    <span>Wait {resendTimer}s</span>
                                ) : (
                                    "Resend code"
                                )}
                            </button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    )
}
