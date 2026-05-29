"use client"

import React, { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from '@hugeicons/react'
import { MailSend01Icon } from '@hugeicons/core-free-icons'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

import { forgotPasswordSchema } from "@/lib/schemas/auth"

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordForm() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        }
    })

    const onSubmit = async (values: ForgotPasswordValues) => {
        setIsSubmitting(true)
        const { data, error } = await authClient.requestPasswordReset({
            email: values.email,
            redirectTo: "/auth/reset-password",
        })
        setIsSubmitting(false)
        if (error) {
            toast.error(error.message || "Something went wrong")
        } else {
            toast.success("A password reset link has been sent to your email address.")
            setIsSubmitted(true)
        }
    }

    if (isSubmitted) {
        return (
            <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
                <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                        <HugeiconsIcon icon={MailSend01Icon} className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                    <CardDescription>
                        We sent a password reset link to <span className="font-medium text-foreground">{form.getValues().email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 md:px-6 flex flex-col gap-4 pb-6 md:pb-6">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/auth/login">Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!form.formState.errors.email}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                placeholder="john@example.com"
                                type="email"
                                aria-invalid={!!form.formState.errors.email}
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <FieldError>{form.formState.errors.email.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full gap-2 mt-4" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                Sending Link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="w-full">
            <ForgotPasswordForm />
        </div>
    )
}
