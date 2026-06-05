"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { PasswordStrength } from "@/components/auth/password-strength"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

import { resetPasswordSchema } from "@/lib/schemas/auth"

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    })

    const passwordValue = form.watch("password")

    const onSubmit = async (values: ResetPasswordValues) => {
        setIsSubmitting(true)

        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get("token")

        if (!token) {
            toast.error("No reset token found in URL. Please request a new link.")
            setIsSubmitting(false)
            return
        }

        const { error } = await authClient.resetPassword({
            newPassword: values.password,
            token: token,
        })
        setIsSubmitting(false)

        if (error) {
            toast.error(error.message || "Failed to reset password. Link might be expired.")
        } else {
            toast.success("Your password has been successfully reset! You can now log in.")
            setIsSuccess(true)
        }
    }

    if (isSuccess) {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Password Reset</CardTitle>
                    <CardDescription>
                        Your password has been successfully reset.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 md:px-6 flex flex-col gap-4 pb-6 md:pb-6">
                    <Button className="w-full" onClick={() => router.push("/auth/login")}>
                        Log in with new password
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>Choose a new password for your account.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!form.formState.errors.password}>
                            <FieldLabel htmlFor="password">New Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-invalid={!!form.formState.errors.password}
                                    {...form.register("password")}
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
                            <PasswordStrength password={passwordValue} />
                            {form.formState.errors.password && (
                                <FieldError>{form.formState.errors.password.message}</FieldError>
                            )}
                        </Field>

                        <Field data-invalid={!!form.formState.errors.confirmPassword}>
                            <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    aria-invalid={!!form.formState.errors.confirmPassword}
                                    {...form.register("confirmPassword")}
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
                            {form.formState.errors.confirmPassword && (
                                <FieldError>{form.formState.errors.confirmPassword.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full gap-2 mt-4" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Remembered your password?{" "}
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full">
            <ResetPasswordForm />
        </div>
    )
}
