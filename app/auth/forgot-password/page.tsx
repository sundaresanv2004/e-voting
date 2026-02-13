"use client"

import React, { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { forgotPasswordAction } from "@/app/auth/actions"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition()
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string>("")

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    async function onSubmit(data: ForgotPasswordInput) {
        startTransition(async () => {
            const result = await forgotPasswordAction(data.email)

            // forgotPasswordAction always returns success to prevent user enumeration
            if (result.success) {
                setIsSuccess(true)
                setSuccessMessage(result.message || "Email sent successfully")
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
                            <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
                        ) : (
                            <KeyRound size={32} className="text-primary" />
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
                            {successMessage || "Email sent successfully"}
                        </p>
                        <p>
                            If an account exists for{" "}
                            <span className="font-medium text-foreground">
                                {form.getValues("email")}
                            </span>
                            , you will receive an email with a link to reset your password.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="email">Email Address</FieldLabel>
                            <Input
                                id="email"
                                placeholder="john@example.com"
                                type="email"
                                {...form.register("email")}
                                aria-invalid={!!form.formState.errors.email}
                            />
                            <FieldError>{form.formState.errors.email?.message}</FieldError>
                        </Field>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Spinner className="h-4 w-4" />}
                            Send Reset Link
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
