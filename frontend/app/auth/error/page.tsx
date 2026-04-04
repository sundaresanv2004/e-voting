"use client"

import React, { Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

enum ErrorType {
    Configuration = "Configuration",
    AccessDenied = "AccessDenied",
    Verification = "Verification",
    Default = "Default"
}

const errorMessages: Record<string, { title: string; description: string }> = {
    [ErrorType.Configuration]: {
        title: "Server Error",
        description: "There is a problem with the server configuration. Please contact support if this persists."
    },
    [ErrorType.AccessDenied]: {
        title: "Access Denied",
        description: "You do not have permission to sign in. Your account might be disabled or restricted."
    },
    [ErrorType.Verification]: {
        title: "Link Expired",
        description: "The verification link has expired or has already been used. Please try signing in again."
    },
    [ErrorType.Default]: {
        title: "Auth Error",
        description: "An unexpected error occurred during authentication. Please try again or contact support."
    }
}

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error") || "Default"

    const { title, description } = errorMessages[error] || errorMessages[ErrorType.Default]

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 ring-4 ring-destructive/5">
                        <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6 flex flex-col items-center gap-6 pb-6 pt-2">
                <Button asChild variant="outline">
                    <Link href="/auth/login" className="flex items-center gap-2">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
                        Return to Login
                    </Link>
                </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-border/40 pb-4 px-0 md:px-6 pt-4 bg-muted/5 rounded-b-3xl">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="opacity-70 uppercase tracking-wider">Error Code</span>
                    <Badge variant="outline" className="font-mono bg-destructive/10 text-destructive uppercase">
                        {error}
                    </Badge>
                </div>
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
