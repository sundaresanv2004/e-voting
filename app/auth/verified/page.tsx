"use client"

import React, { Suspense } from "react"
import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

function VerifiedContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const next = searchParams.get('next')

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                {/* Icon - matching style with verify-email and error pages */}
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20 ring-4 ring-green-500/5">
                        <ShieldCheck size={32} />
                    </div>
                </div>

                <CardTitle className="text-2xl font-bold">Email Verified</CardTitle>
                <CardDescription className="text-balance">
                    Your email {email && <span className="font-medium text-foreground">{email}</span>} has been successfully verified.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 text-center md:px-6">
                <p className="text-sm text-muted-foreground">
                    You can now access your account and participate in elections.
                </p>
            </CardContent>

            <CardFooter className="px-0 flex-col gap-3 md:px-6 pb-4">
                <Button className="w-full" size="lg" asChild>
                    <Link href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>
                        Continue to Login
                    </Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Your account is ready to use
                </p>
            </CardFooter>
        </Card>
    )
}

export default function VerifiedPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        }>
            <VerifiedContent />
        </Suspense>
    )
}
