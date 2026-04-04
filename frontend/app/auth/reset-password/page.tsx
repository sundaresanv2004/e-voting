import React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, LinkSquare01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { getPasswordResetTokenByToken } from "@/lib/actions/auth-actions"
import { ResetPasswordForm } from "./_components/reset-password-form"
import { Button } from "@/components/ui/button"

interface ResetPasswordPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = await searchParams
    const token = params.token as string | undefined

    if (!token) {
        return (
            <ErrorCard
                title="Missing Reset Link"
                description="The password reset token is missing. Please request a new link."
            />
        )
    }

    const existingToken = await getPasswordResetTokenByToken(token)

    if (!existingToken) {
        return (
            <ErrorCard
                title="Invalid or Expired Link"
                description="This reset link is invalid or has already expired. Please request a new one."
            />
        )
    }

    return <ResetPasswordForm token={token} />
}

function ErrorCard({ title, description }: { title: string; description: string }) {
    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 ring-4 ring-destructive/5">
                        <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-destructive">{title}</CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6 flex justify-center pb-6">
                <Link href="/auth/forgot-password">
                    <Button>
                        <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4" />
                        Request New Link
                    </Button>
                </Link>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6 pt-4">
                <p className="text-sm text-muted-foreground">
                    Back to{" "}
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
