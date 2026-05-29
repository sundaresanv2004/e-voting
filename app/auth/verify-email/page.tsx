"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Alert01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons'

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useRouter, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { verifySchema } from "@/lib/schemas/auth"

type VerifyValues = z.infer<typeof verifySchema>

function VerifyEmailForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams?.get("email") || "sundaresansoundar24@gmail.com"
    const [countdown, setCountdown] = useState(30)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (countdown === 0) return
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [countdown])

    const handleResend = async () => {
        setCountdown(60)
        await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "email-verification",
        })
        toast.success("Verification code resent to your email")
    }

    const form = useForm<VerifyValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: "",
        }
    })

    const onSubmit = async (values: VerifyValues) => {
        setIsSubmitting(true)
        const { error } = await authClient.emailOtp.verifyEmail({
            email,
            otp: values.code
        })
        setIsSubmitting(false)
        
        if (error) {
            form.setError("code", { message: error.message || "Invalid code" })
            form.setValue("code", "") // Automatically clear the invalid OTP
            return
        }
        
        toast.success("Account verified successfully")
        router.push("/auth/verified")
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6 flex flex-col items-center">
                <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                <div className="flex flex-col items-center gap-3 mt-1.5 w-full">
                    <span className="text-sm text-muted-foreground">We&apos;ve sent a 6-digit verification code to</span>
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-muted/40 border border-border/80 rounded-full text-sm font-medium text-foreground w-fit max-w-full truncate">
                        <span className="truncate">{email}</span>
                        <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center w-full">
                    <div className="w-full max-w-[338px] flex flex-col items-center">
                        {form.formState.errors.code && (
                            <Alert variant="destructive" className="mb-4 w-full text-left">
                                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                                <AlertDescription>{form.formState.errors.code.message}</AlertDescription>
                            </Alert>
                        )}
                        
                        <FieldGroup className="w-full flex flex-col items-center">
                            <Field data-invalid={!!form.formState.errors.code} className="flex flex-col items-center w-full">
                                <FieldLabel htmlFor="code" className="sr-only">Verification Code</FieldLabel>
                                
                                <Controller
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <InputOTP
                                            maxLength={6}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val)
                                                // Clear error state as soon as user types
                                                if (form.formState.errors.code) {
                                                    form.clearErrors("code")
                                                }
                                                // Auto-submit when 6 digits are entered
                                                if (val.length === 6) {
                                                    setTimeout(() => form.handleSubmit(onSubmit)(), 0)
                                                }
                                            }}
                                            aria-invalid={!!form.formState.errors.code}
                                            containerClassName="justify-center"
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
                            </Field>
                        </FieldGroup>

                        <Button 
                            type="submit" 
                            className="w-full gap-2 mt-8"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner />
                                    Verifying Account...
                                </>
                            ) : (
                                "Verify Account"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center items-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    {countdown > 0 ? (
                        <span className="text-primary font-medium">Try again in {countdown}s</span>
                    ) : (
                        <button type="button" onClick={handleResend} className="text-primary font-medium hover:underline cursor-pointer">
                            Resend code
                        </button>
                    )}
                </p>
            </CardFooter>
        </Card>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="w-full">
            <Suspense fallback={<div className="text-center text-muted-foreground pt-12">Loading...</div>}>
                <VerifyEmailForm />
            </Suspense>
        </div>
    )
}
