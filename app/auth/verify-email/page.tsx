"use client"

import React, { Suspense, useState, useEffect, useTransition } from "react"
import { Mail, RotateCw, Clock, AlertCircle, CheckCircle2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')

    const [isPending, startTransition] = useTransition()
    const [timer, setTimer] = useState(30)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleResend = () => {
        if (!email) {
            setStatus({ type: 'error', message: "Email address not found. Please try signing up again." })
            return
        }

        setStatus(null)
        startTransition(async () => {
            console.log("Resending email to", email)
        })
    }

    const formatTime = (seconds: number) => {
        return `00:${seconds < 10 ? `0${seconds}` : seconds}`
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                {/* Centered Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 ring-4 ring-primary/5">
                        <Mail size={32} />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription className="text-balance">
                    We&#39;ve sent a verification link to
                </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
                <div
                    className="mx-auto w-fit max-w-full bg-secondary/40 border border-border/60 rounded-full pl-4 pr-1 py-1 flex items-center gap-3 mb-6 group hover:bg-secondary/60 transition-colors">
                    <span className="text-foreground text-sm font-medium truncate max-w-[200px]">
                        {email || "your email"}
                    </span>
                    <Link href="/auth/signup" title="Change email">
                        <div
                            className="h-8 w-8 bg-background rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm cursor-pointer">
                            <Edit size={16} />
                        </div>
                    </Link>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Click the link in the email to verify your account. <br className="hidden md:block" />
                    If you don&#39;t see it, check your spam folder.
                </p>

                {status && (
                    <Alert variant={status.type === 'error' ? "danger" : "success"}>
                        {status.type === 'success' ? <CheckCircle2 size={16} /> :
                            <AlertCircle size={16} />}
                        <AlertDescription className={"text-start text-destructive"}>{status.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                    <div className="w-full px-4">
                        <Button
                            variant="outline"
                            className={"w-full transition-all duration-300 font-medium"}
                            onClick={handleResend}
                            disabled={isPending || timer > 0}
                        >
                            <div className="flex items-center justify-center gap-2 relative z-10">
                                {isPending ? (
                                    <>
                                        <Spinner className="w-4 h-4" />
                                        <span>Sending email...</span>
                                    </>
                                ) : timer > 0 ? (
                                    <>
                                        <Clock size={16} className="animate-pulse" />
                                        <span
                                            className="tabular-nums tracking-wide">Resend in {formatTime(timer)}</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCw size={16} />
                                        <span>Resend Verification Email</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Already verified?{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <VerifyEmailContent />
        </Suspense>
    )
}
