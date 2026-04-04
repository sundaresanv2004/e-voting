"use client"

import React, { useState, useTransition } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkBadge01Icon, ShieldKeyIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { resetPassword } from "@/lib/actions/auth-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ForgotPasswordSchema } from "@/lib/schemas/auth"
import { z } from "zod"

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [emailSubmitted, setEmailSubmitted] = useState<string>("")

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        }
    })

    const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
        setError(null)
        setEmailSubmitted(values.email)

        const formData = new FormData()
        formData.append("email", values.email)

        startTransition(async () => {
            const result = await resetPassword(formData)

            if (result.success) {
                setIsSuccess(true)
                toast.success("Verification link sent successfully")
            } else {
                setError(result.error || "Internal Server Error")
            }
        })
    }

    return (
        <Card className="w-full border-none shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pb-3 pt-0 md:pt-6 px-0 md:px-6">
                <div className="flex justify-center mb-4">
                    <div className={cn(
                        "p-3 rounded-xl flex items-center justify-center border ring-4",
                        isSuccess ? "bg-green-100 border-green-600/20 ring-green-200/20 dark:bg-green-900/20 dark:border-green-400/20 dark:ring-green-900/30" : "bg-primary/10 border-primary/20 ring-primary/5"
                    )}>
                        {isSuccess ? (
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-8 h-8 text-green-600 dark:text-green-500" />
                        ) : (
                            <HugeiconsIcon icon={ShieldKeyIcon} className="w-8 h-8 text-primary" />
                        )}
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                    {isSuccess ? "Check your email" : "Reset Password"}
                </CardTitle>
                <CardDescription>
                    {isSuccess
                        ? "We've sent you recovery link"
                        : "Enter your email to receive reset link"
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6">
                {isSuccess ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                        <p className="mb-2 font-medium text-foreground">
                            Check your email
                        </p>
                        <p>
                            If an account exists for {emailSubmitted}, you will receive an email with a link to reset your password.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="flex items-center text-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl">
                                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive mb-1" />
                                <AlertDescription className="text-destructive">{error}</AlertDescription>
                            </Alert>
                        )}
                        <Field>
                            <FieldLabel htmlFor="email">Email Address</FieldLabel>
                            <Input
                                id="email"
                                placeholder="john@example.com"
                                type="email"
                                disabled={isPending}
                                {...register("email")}
                            />
                            <FieldError errors={[{ message: errors.email?.message }]} />
                        </Field>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Spinner className="h-4 w-4" />}
                            {isPending ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                )}
            </CardContent>

            {isSuccess ? (
                <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
                    <p className="text-sm text-muted-foreground">
                        Back to{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            ) : (
                <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
                    <p className="text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            )}
        </Card>
    )
}
