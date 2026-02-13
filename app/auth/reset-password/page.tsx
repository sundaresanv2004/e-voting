"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import 'client-only'
// We'll use simple inputs instead of Form components if they are missing
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas/auth"
import { Spinner } from "@/components/ui/spinner"
import { logoutAction, updatePasswordAction } from "@/app/auth/actions"
// Assuming PasswordStrength component exists, if not we'll remove it
// import { PasswordStrength } from "@/components/auth/password-strength"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<{ message: string; code?: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const passwordValue = form.watch("password")

    // Check if user has a valid session
    useEffect(() => {
        async function checkSession() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // Determine if we should redirect or just show loading/error
                // Ideally middleware handles this, but client check is good too
                // For now we just stop loading check
            }

            setIsCheckingSession(false)
        }

        checkSession()
    }, [router])

    async function onSubmit(data: ResetPasswordInput) {
        setError(null)
        startTransition(async () => {
            const result = await updatePasswordAction(data.password)

            if (!result.success) {
                setError({
                    message: result.error || "Failed to update password",
                    code: result.code
                })
                return
            }

            setIsSuccess(true)
            // Wait a moment then logout
            setTimeout(async () => {
                await logoutAction()
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
                            <CheckCircle2 size={32} className="text-green-600 dark:text-green-400 drop-shadow-sm" />
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
                        <Lock size={32} />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                <CardDescription>
                    Enter a strong password for your account
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6 pb-4">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle size={16} />
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...form.register("password")}
                                aria-invalid={!!form.formState.errors.password}
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldError>{form.formState.errors.password?.message}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...form.register("confirmPassword")}
                                aria-invalid={!!form.formState.errors.confirmPassword}
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldError>{form.formState.errors.confirmPassword?.message}</FieldError>
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
