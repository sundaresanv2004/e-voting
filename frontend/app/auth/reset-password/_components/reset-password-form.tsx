"use client"

import React, { useState, useTransition, useEffect } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon, CheckmarkBadge01Icon, ShieldKeyIcon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { newPassword } from "@/lib/actions/auth-actions"
import { PasswordStrength } from "@/components/auth/password-strength"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetPasswordSchema } from "@/lib/schemas/auth"
import { z } from "zod"

interface ResetPasswordFormProps {
    token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    })

    const passwordValue = watch("password")

    const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
        setError(null)

        startTransition(async () => {
            const result = await newPassword(values.password, values.confirmPassword, token)

            if (result.success) {
                router.push("/auth/login?reset_success=true")
            } else {
                setError(result.error || "Update failed")
            }
        })
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
                        <Spinner />
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="flex items-center text-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive mb-1" />
                            <AlertDescription className="text-destructive">{error}</AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="password">New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                disabled={isPending}
                                {...register("password")}
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
                        <FieldError errors={[{ message: errors.password?.message }]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                disabled={isPending}
                                {...register("confirmPassword")}
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
                        <FieldError errors={[{ message: errors.confirmPassword?.message }]} />
                    </Field>

                    <Button type="submit" className="w-full gap-2" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner />
                                Updating...
                            </>
                        ) : "Update Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
