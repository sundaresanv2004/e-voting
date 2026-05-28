"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

import { loginSchema } from "@/lib/schemas/auth"

type LoginValues = z.infer<typeof loginSchema>

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = (values: LoginValues) => {
        console.log("Login submitted:", values)
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

                    <Button type="submit" className="w-full gap-2 mt-4">
                        Sign In
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
