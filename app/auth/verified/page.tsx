"use client"

import React from "react"
import Link from "next/link"
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function VerifiedPage() {
    return (
        <div className="w-full">
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50 dark:ring-green-900/20">
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Your email address has been successfully verified. You can now access your account.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0 md:px-6 mt-4">
                    <Button className="w-full gap-2" asChild>
                        <Link href="/auth/login">
                            Continue to Login
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
