"use client"

import React, { Suspense } from "react"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner";

function VerifiedContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const next = searchParams.get('next')

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="text-center flex flex-col items-center">
                <div className="mb-4 rounded-full bg-green-500/10 p-3 text-green-500">
                    <CheckCircle2 size={32} />
                </div>
                <CardTitle className="text-xl">Email Verified</CardTitle>
                <CardDescription>
                    Your email {email ? <span className="font-medium text-foreground">{email}</span> : ''} has been successfully verified.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
                You can now access your account and participate in elections.
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/50 pt-6 pb-2">
                <p className="text-sm text-muted-foreground">
                    Continue to{" "}
                    <Link href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function VerifiedPage() {
    return (
        <div>
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center">
                    <Spinner className="h-8 w-8 text-primary/50" />
                </div>
            }>
                <VerifiedContent />
            </Suspense>
        </div>
    )
}
