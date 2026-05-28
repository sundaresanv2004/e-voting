"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { PasswordStrength } from "@/components/auth/password-strength"
import { OAuthButtons } from "@/components/auth/oauth-buttons"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

import { signupSchema } from "@/lib/schemas/auth"

type SignupValues = z.infer<typeof signupSchema>

function SignupForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        }
    })

    const passwordValue = form.watch("password")

    const onSubmit = async (values: SignupValues) => {
        setIsSubmitting(true)
        console.log("Signup submitted:", values)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                <CardDescription>Enter your details to get started.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <OAuthButtons />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/80 backdrop-blur-md px-2 text-muted-foreground rounded-full">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field data-invalid={!!form.formState.errors.name}>
                            <FieldLabel htmlFor="name">Full Name</FieldLabel>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                aria-invalid={!!form.formState.errors.name}
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <FieldError>{form.formState.errors.name.message}</FieldError>
                            )}
                        </Field>

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
                            <FieldLabel htmlFor="password">Password</FieldLabel>
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
                            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
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

                        <Field orientation="horizontal" data-invalid={!!form.formState.errors.acceptTerms}>
                            <Controller
                                control={form.control}
                                name="acceptTerms"
                                render={({ field }) => (
                                    <Checkbox
                                        id="acceptTerms"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-invalid={!!form.formState.errors.acceptTerms}
                                    />
                                )}
                            />
                            <div className="space-y-1 leading-none">
                                <FieldLabel htmlFor="acceptTerms" className="font-normal text-muted-foreground">
                                    I agree to the{" "}
                                    <Link href="/terms" className="text-primary hover:underline">
                                        Terms
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </Link>
                                </FieldLabel>
                                {form.formState.errors.acceptTerms && (
                                    <FieldError>{form.formState.errors.acceptTerms.message}</FieldError>
                                )}
                            </div>
                        </Field>
                    </FieldGroup>

                    <Button type="submit" className="w-full gap-2 mt-4" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner />
                                Registering...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 pt-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function SignupPage() {
    return (
        <div className="w-full">
            <SignupForm />
        </div>
    )
}
