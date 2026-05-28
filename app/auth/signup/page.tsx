"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import Link from "next/link"
import { PasswordStrength } from "@/components/auth/password-strength"
import { OAuthButtons } from "@/components/auth/oauth-buttons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

function SignupForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordValue, setPasswordValue] = useState("")

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

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Field>
                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="John Doe"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            placeholder="john@example.com"
                            type="email"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwordValue}
                                onChange={(e) => setPasswordValue(e.target.value)}
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
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                    </Field>

                    <Field orientation="horizontal">
                        <Checkbox
                            id="acceptTerms"
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
                        </div>
                    </Field>

                    <Button type="submit" className="w-full gap-2">
                        Create Account
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
