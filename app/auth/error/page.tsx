"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    
    let errorMessage = "An unknown error occurred during authentication."
    
    if (error === "unable_to_create_user") {
        errorMessage = "We could not create your account at this time. Please ensure your information is correct and try again."
    } else if (error === "Configuration") {
        errorMessage = "There is a problem with the server configuration. Please contact support."
    } else if (error === "AccessDenied") {
        errorMessage = "You do not have permission to sign in."
    } else if (error === "Verification") {
        errorMessage = "The verification token has expired or has already been used."
    } else if (error === "invalid_callback_request" || error === "state_not_found") {
        errorMessage = "The login request expired or was invalid. Please try again."
    } else if (error === "missing_profile" || error === "invalid_profile") {
        errorMessage = "We could not securely retrieve your profile information from the provider."
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 ring-8 ring-destructive/5">
                    <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
                <CardDescription className="text-base mt-2">
                    {errorMessage}
                </CardDescription>
                {error && (
                    <div className="mt-4 inline-flex items-center rounded-md border bg-muted px-2.5 py-0.5 text-xs font-semibold font-mono text-muted-foreground">
                        CODE: {error}
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-0 md:px-6 mt-4">
                <Button className="w-full gap-2" asChild>
                    <Link href="/auth/login">
                        Try Again
                    </Link>
                </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <Link href="/" className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <HugeiconsIcon 
                        icon={ArrowLeft01Icon} 
                        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
                    />
                    Back to home
                </Link>
            </CardFooter>
        </Card>
    )
}

export default function ErrorPage() {
    return (
        <div className="w-full">
            <Suspense fallback={
                <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
                    <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                        <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            }>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
