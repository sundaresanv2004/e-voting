"use client"

import React, { useState, useTransition, useEffect } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon, CheckmarkBadge01Icon, ShieldKeyIcon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import 'client-only'
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<{ message: string; code?: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    // Removed Supabase session check, skipping check for mock flow
    useEffect(() => {
        setIsCheckingSession(false)
    }, [])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        
        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (!password || !confirmPassword) {
            setError({ message: "Passwords are required" })
            return
        }

        if (password !== confirmPassword) {
            setError({ message: "Passwords do not match" })
            return
        }

        startTransition(async () => {
            // Mock backend call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setIsSuccess(true)
            // Wait a moment then redirect to login
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        })
    }

    if (isCheckingSession) {
        return (
            <div className="container relative flex min-h-screen flex-col items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Spinner className="mb-4" />
                        <p className="text-sm text-muted-foreground">Verifying your session...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
                <CardHeader className="text-center pt-0 md:pt-6">
                    <div className="flex relative justify-center mb-4">
                        <div
                            className="relative p-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/10 flex items-center justify-center ring-1 ring-green-500/20 shadow-sm">
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-8 h-8 text-green-600 dark:text-green-400 drop-shadow-sm" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Password Updated!</CardTitle>
                    <CardDescription>
                        Your password has been changed successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 text-center text-sm text-muted-foreground md:px-6 pb-6">
                    <p>Redirecting to login page...</p>
                    <div className="mt-4 flex justify-center">
                        <Spinner className="h-6 w-6 text-primary" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6">
                <div className="flex justify-center mb-4">
                    <div
                        className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 ring-4 ring-primary/5">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                <CardDescription>
                    Enter a strong password for your account
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6 pb-4">
                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                name="password"
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <HugeiconsIcon icon={ViewOffSlashIcon} className="w-4 h-4" />
                                ) : (
                                    <HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <HugeiconsIcon icon={ViewOffSlashIcon} className="w-4 h-4" />
                                ) : (
                                    <HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        Update Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
