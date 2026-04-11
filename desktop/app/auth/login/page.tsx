"use client"

import React, { useState, useTransition, Suspense } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/lib/schemas/auth"
import { z } from "zod"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"

function LoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const searchParams = useSearchParams()
    const nextParam = searchParams.get("next")
    const router = useRouter()
    const { login } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError(null)

        startTransition(async () => {
            try {
                await login(values.email, values.password)
                toast.success("Successfully logged in!")
                if (nextParam) {
                    router.push(nextParam)
                } else {
                    router.push('/admin/organization')
                }
            } catch (err: any) {
                if (err.message === "NOT_VERIFIED") {
                    const [localPart, domain] = values.email.split("@")
                    const maskedEmail = localPart.length > 2
                        ? `${localPart.substring(0, 2)}*****${localPart.substring(localPart.length - 2)}@${domain}`
                        : values.email
                    toast.info(`Verification code sent to ${maskedEmail}`)
                    router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
                    return
                }
                setError(err?.detail || "Invalid email or password")
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Enter your credentials to access your account.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
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
                            placeholder="john@example.com"
                            type="email"
                            disabled={isPending}
                            {...register("email")}
                        />
                        <FieldError errors={[{ message: errors.email?.message }]} />
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
                        <FieldError errors={[{ message: errors.password?.message }]} />
                    </Field>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        {isPending ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-2 border-t border-border/50 pb-4 px-0 md:px-6">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/signup${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`} className="text-primary font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
                <Button variant="ghost" size="sm" asChild className="text-[10px] sm:text-xs opacity-40 hover:opacity-100 h-7">
                    <Link href="loading">
                        Preview Loading UI
                    </Link>
                </Button>
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
