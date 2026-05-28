"use client"

import React, { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useRouter } from "next/navigation"

import { verifySchema } from "@/lib/schemas/auth"

type VerifyValues = z.infer<typeof verifySchema>

function VerifyEmailForm() {
    const router = useRouter()
    
    const form = useForm<VerifyValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: "",
        }
    })

    const onSubmit = (values: VerifyValues) => {
        console.log("OTP submitted:", values)
        // Mock success transition
        router.push("/auth/verified")
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                <CardDescription>We sent a 6-digit code to your email. Enter it below to verify your account.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center">
                    <FieldGroup className="w-full flex flex-col items-center">
                        <Field data-invalid={!!form.formState.errors.code} className="flex flex-col items-center w-full">
                            <FieldLabel htmlFor="code" className="sr-only">Verification Code</FieldLabel>
                            
                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <InputOTP
                                        maxLength={6}
                                        value={field.value}
                                        onChange={field.onChange}
                                        aria-invalid={!!form.formState.errors.code}
                                        className="gap-2"
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                )}
                            />
                            
                            {form.formState.errors.code && (
                                <FieldError className="text-center mt-2">{form.formState.errors.code.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full gap-2 mt-8">
                        Verify Email
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col justify-center items-center gap-4 border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive a code?{" "}
                    <button type="button" className="text-primary font-medium hover:underline">
                        Resend
                    </button>
                </p>
                <Link href="/auth/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
                    Back to login
                </Link>
            </CardFooter>
        </Card>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="w-full">
            <VerifyEmailForm />
        </div>
    )
}
