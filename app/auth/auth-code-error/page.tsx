"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

interface AuthError {
    code: string;
    description: string;
}

function AuthCodeErrorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialized = useRef(false)
    const [isProcessing, setIsProcessing] = useState(true)

    // Initial state from Search Params (Server/Redirect errors)
    const [error, setError] = useState<AuthError | null>(() => {
        const code = searchParams.get("error_code") || searchParams.get("error")
        const desc = searchParams.get("error_description")
        if (code || desc) {
            return { code: code || "Error", description: desc || "An error occurred" }
        }
        return null
    })

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        // CHECK HASH FOR TOKENS (Success Case)
        if (typeof window !== "undefined" && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1))

            const accessToken = hashParams.get("access_token")
            const refreshToken = hashParams.get("refresh_token")

            // If we have an access token, it's a success!
            if (accessToken && refreshToken) {
                const supabase = createClient()

                // Set the session manually
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                }).then(async ({ data, error }) => {
                    if (!error && data.session) {
                        // Success: Redirect to verified page
                        const email = data.session.user.email || ""
                        router.push(`/auth/verified?email=${encodeURIComponent(email)}`)
                    } else {
                        // Failed to restore session
                        setIsProcessing(false)
                        setError({ code: "session_error", description: "Failed to establish session." })
                    }
                })
                return // Stop here, wait for redirect
            }

            // CHECK HASH FOR ERRORS (Failure Case: otp_expired, etc.)
            const errorCode = hashParams.get("error_code") || hashParams.get("error")
            const errorDesc = hashParams.get("error_description")?.replace(/\+/g, " ")

            if (errorCode || errorDesc) {
                setError({
                    code: errorCode || "Unknown Error",
                    description: errorDesc || "An unknown error occurred.",
                })
                setIsProcessing(false)
                return
            }
        }

        // If no hash, stop processing and show whatever state we have
        setIsProcessing(false)
    }, [router])

    // Show loading while we check for tokens
    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Spinner className="h-8 w-8 mb-4 text-primary" />
                <p className="text-muted-foreground">Verifying...</p>
            </div>
        )
    }

    const isExpired = error?.code === "otp_expired" || error?.description?.toLowerCase().includes("expired")
    const isAlreadyUsed = error?.code === "otp_disabled" || error?.description?.toLowerCase().includes("already been used")

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div
                        className="p-3 rounded-2xl flex bg-destructive/10 items-center justify-center text-destructive border border-destructive/20 ring-4 ring-destructive/5">
                        <AlertCircle size={32} />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
                <CardDescription className="text-balance">
                    {isExpired
                        ? "Your verification link has expired."
                        : isAlreadyUsed
                            ? "This verification link has already been used."
                            : "We couldn't verify your request."}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 text-center md:px-6">
                <p className="text-sm text-muted-foreground mb-4">
                    {error?.description || "Please try the action again."}
                </p>

                {(isExpired || isAlreadyUsed) && (
                    <p className="text-sm text-muted-foreground">
                        {isAlreadyUsed
                            ? "If you've already verified your email, you can log in directly."
                            : "Please request a new verification email or try signing up again."}
                    </p>
                )}
            </CardContent>

            <CardFooter className="px-0 flex-col gap-2 md:px-6 pb-4">
                <Button className="w-full" asChild>
                    <Link href="/auth/login">
                        {isAlreadyUsed ? "Go to Login" : "Back to Login"}
                        <ArrowRight size={16} className="ml-2" />
                    </Link>
                </Button>
                {isExpired && (
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/auth/signup">
                            Try Signing Up Again
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Spinner className="h-8 w-8" />
            </div>
        }>
            <AuthCodeErrorContent />
        </Suspense>
    )
}
