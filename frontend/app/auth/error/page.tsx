"use client"

import React, { Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

enum ErrorType {
    Configuration = "Configuration",
    AccessDenied = "AccessDenied",
    Verification = "Verification",
    Default = "Default"
}

const errorMessages: Record<ErrorType | string, { title: string; description: string }> = {
    [ErrorType.Configuration]: {
        title: "Server Error",
        description: "There is a problem with the server configuration. Please contact support if this persists."
    },
    [ErrorType.AccessDenied]: {
        title: "Access Denied",
        description: "You do not have permission to sign in. Your account might be disabled or restricted."
    },
    [ErrorType.Verification]: {
        title: "Verification Failed",
        description: "The verification link has expired or has already been used. Please try signing in again."
    },
    [ErrorType.Default]: {
        title: "Authentication Error",
        description: "An unexpected error occurred during authentication. Please try again."
    }
}

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error") as ErrorType || ErrorType.Default

    const { title, description } = errorMessages[error] || errorMessages[ErrorType.Default]

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                        <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8 text-destructive" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription>Something went wrong during the sign-in process.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6">
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 rounded-2xl">
                    <AlertTitle className="text-destructive font-semibold">Error Details</AlertTitle>
                    <AlertDescription className="text-destructive/90">
                        {description}
                    </AlertDescription>
                </Alert>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pb-4 px-0 md:px-6">
                <Button asChild className="w-full">
                    <Link href="/auth/login">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
                        Back to Login
                    </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Error Code: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase">{error}</span>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <AuthErrorContent />
        </Suspense>
    )
}
