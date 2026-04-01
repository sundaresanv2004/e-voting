"use client"

import React, { useState, useTransition, Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { toast } from "sonner"

function LoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const redirectTo = formData.get("redirectTo") as string

        if (!email || !password) {
            setError("Email and password are required")
            return
        }

        startTransition(async () => {
            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (result?.error) {
                    setError("Invalid email or password")
                    return
                }

                if (redirectTo) {
                    router.push(redirectTo)
                } else {
                    router.push('/dashboard')
                }
                router.refresh()
            } catch (err) {
                console.error("Login error:", err)
                setError('An unexpected error occurred. Please try again.')
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <OAuthButtons disabled={isPending} />

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground rounded-full bg-blur-3xl">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="flex items-center text-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive mb-1" />
                            <AlertDescription className="text-destructive">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            name="email"
                            required
                            placeholder="john@example.com"
                            type="email"
                        />
                    </Field>

                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                name="password"
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                    </Field>

                    {nextParam && <input type="hidden" name="redirectTo" value={nextParam} />}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        Sign In
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/signup${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="text-primary font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <LoginForm />
        </Suspense>
    )
}
