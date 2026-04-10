"use client"

import React, { useState, useTransition, Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PasswordStrength } from "@/components/auth/password-strength"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignupSchema } from "@/lib/schemas/auth"
import { z } from "zod"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"

function SignupForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")
    const router = useRouter()
    const { signup } = useAuth()

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors }
    } = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        }
    })

    const passwordValue = watch("password")

    const onSubmit = (values: z.infer<typeof SignupSchema>) => {
        setError(null)

        startTransition(async () => {
            try {
                await signup(values.name, values.email, values.password)
                toast.success("Account created successfully!")
                if (nextParam) {
                    router.push(nextParam)
                } else {
                    router.push('/admin/organization')
                }
            } catch (err: any) {
                setError(err?.detail || "Failed to create account")
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Create an Account</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Enter your details to get started.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <OAuthButtons disabled={isPending} />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground rounded-full">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="w-8 h-8 text-destructive mb-1" />
                            <AlertDescription className="text-sm text-destructive">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            disabled={isPending}
                            {...register("name")}
                        />
                        <FieldError errors={[{ message: errors.name?.message }]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            placeholder="john@example.com"
                            type="email"
                            disabled={isPending}
                            {...register("email")}
                        />
                        <FieldError errors={[{ message: errors.email?.message }]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
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
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
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

                    <Field orientation="horizontal">
                        <Controller
                            name="acceptTerms"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="acceptTerms"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isPending}
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
                            <FieldError errors={[{ message: errors.acceptTerms?.message }]} />
                        </div>
                    </Field>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        {isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
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
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <SignupForm />
        </Suspense>
    )
}
