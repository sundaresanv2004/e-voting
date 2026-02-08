"use client"

import React, { useState, useTransition, Suspense } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signupSchema, type SignupInput } from "@/lib/schemas/auth"
import { PasswordStrength } from "@/components/auth/password-strength"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"


function SignupForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")
    const router = useRouter()

    const form = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
            redirectTo: nextParam || undefined
        },
    })

    const passwordValue = form.watch("password")

    async function onSubmit(data: SignupInput) {
        setError(null)

        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append('email', data.email)
                formData.append('password', data.password)
                formData.append('name', data.name)

                const { signUp } = await import('@/app/auth/actions')
                const result = await signUp(formData)

                if (!result.success && result.error) {
                    setError(result.error)
                }
                // If successful, the action will redirect automatically
            } catch (err) {
                setError('An unexpected error occurred. Please try again.')
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                <CardDescription>Enter your details to get started.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <OAuthButtons disabled={isPending} />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground rounded-full">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle size={16} className="text-destructive" />
                            <AlertDescription className="text-sm text-destructive">
                                <span>{error}</span>
                                {(error.toLowerCase().includes("already registered") ||
                                    error.toLowerCase().includes("already exists")) && (
                                        <>
                                            {" "}
                                            <Link
                                                href="/auth/login"
                                                className="font-medium underline underline-offset-4 hover:text-destructive-foreground"
                                            >
                                                Login here
                                            </Link>
                                        </>
                                    )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...form.register("name")}
                            aria-invalid={!!form.formState.errors.name}
                        />
                        <FieldError>{form.formState.errors.name?.message}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            placeholder="john@example.com"
                            type="email"
                            {...form.register("email")}
                            aria-invalid={!!form.formState.errors.email}
                        />
                        <FieldError>{form.formState.errors.email?.message}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...form.register("password")}
                                aria-invalid={!!form.formState.errors.password}
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                        <PasswordStrength password={passwordValue} />
                        <FieldError>{form.formState.errors.password?.message}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...form.register("confirmPassword")}
                                aria-invalid={!!form.formState.errors.confirmPassword}
                            />
                            <InputGroupAddon
                                align="inline-end"
                                className="cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldError>{form.formState.errors.confirmPassword?.message}</FieldError>
                    </Field>

                    <Field orientation="horizontal">
                        <Controller
                            control={form.control}
                            name="acceptTerms"
                            render={({ field }) => (
                                <>
                                    <Checkbox
                                        id="acceptTerms"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        aria-invalid={!!form.formState.errors.acceptTerms}
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
                                        <FieldError>{form.formState.errors.acceptTerms?.message}</FieldError>
                                    </div>
                                </>
                            )}
                        />
                    </Field>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        Create Account
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
