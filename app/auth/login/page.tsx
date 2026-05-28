"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { signIn } from "@/lib/auth-client"
import { toast } from "sonner"

import { loginSchema } from "@/lib/schemas/auth"

type LoginValues = z.infer<typeof loginSchema>

function LoginForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (values: LoginValues) => {
        setIsSubmitting(true)
        const { data, error } = await signIn.email({
            email: values.email,
            password: values.password,
        })
        setIsSubmitting(false)

        if (error) {
            // Intercept & Redirect approach for unverified emails
            if (error.code === "EMAIL_NOT_VERIFIED" || error.message?.toLowerCase().includes("not verified")) {
                toast.error("Please verify your email to login.")
                // Send a fresh OTP automatically
                const { authClient } = await import("@/lib/auth-client")
                const res = await authClient.emailOtp.sendVerificationOtp({
                    email: values.email,
                    type: "email-verification",
                })
                
                if (res.error) {
                    toast.error(res.error.message || "Failed to send verification email. Please try resending from the next page.")
                } else {
                    toast.success("A new verification code has been sent to your email.")
                }
                
                router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
                return
            }
            setErrorMsg(error.message || "Invalid email or password.")
        } else {
            toast.success("Successfully logged in!")
            router.push("/")
        }
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <OAuthButtons />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/80 backdrop-blur-md px-2 text-muted-foreground rounded-full">Or continue with</span>
                    </div>
                </div>

                {errorMsg && (
                    <Alert variant="destructive" className="mb-4">
                        <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                )}

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

                        <Field data-invalid={!!form.formState.errors.password}>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                    Forgot password?
                                </Link>
                            </div>
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
                            {form.formState.errors.password && (
                                <FieldError>{form.formState.errors.password.message}</FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full gap-2 mt-4" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="w-full">
            <LoginForm />
        </div>
    )
}
