"use client"

import React, { useState, useTransition, Suspense, useEffect } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon } from '@hugeicons/core-free-icons'
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { OrganizationConnectSchema, OrganizationConnectValues } from "@/lib/schemas/organization"
import { openExternalUrl } from "@/lib/utils/external-url"
import { toast } from "sonner"
import { useTerminal } from "@/components/shared/terminal-context"

function OrganizationConnectForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { refresh } = useTerminal()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<OrganizationConnectValues>({
        resolver: zodResolver(OrganizationConnectSchema),
        defaultValues: {
            organizationCode: "",
            systemName: "",
        }
    })

    // Check for rejection error in URL
    const searchParams = useSearchParams()
    useEffect(() => {
        if (searchParams.get("error") === "rejected") {
            setError("Your terminal connection request was rejected by the administrator. Please try again or contact support.")
        }
    }, [searchParams])

    // User submits connection request
    const onSubmit = (values: OrganizationConnectValues) => {
        setError(null)
        startTransition(async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (window as any).electron.terminal.register(values);
                if (result.success) {
                    // Force refresh terminal state so routing guard knows we are PENDING
                    await refresh();

                    toast.success(`Your terminal "${values.systemName}" is now awaiting admin approval.`)
                    router.push("/verify/pending")
                } else {
                    setError(result.error || "Please check your organization code and try again.")
                }
            } catch (e) {
                setError("An internal error occurred during registration.")
                console.error(e)
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Connect Organisation</CardTitle>
                <CardDescription>Register your terminal using a secure organisation code to sync with the network.</CardDescription>
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
                        <FieldLabel htmlFor="organizationCode">Organisation Code</FieldLabel>
                        <Input
                            id="organizationCode"
                            placeholder="e.g. ORG-123456"
                            type="text"
                            disabled={isPending}
                            {...register("organizationCode")}
                        />
                        <FieldError errors={[{ message: errors.organizationCode?.message }]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="systemName">System Name</FieldLabel>
                        <Input
                            id="systemName"
                            placeholder="e.g. Reception Terminal 1"
                            type="text"
                            disabled={isPending}
                            {...register("systemName")}
                        />
                        <FieldError errors={[{ message: errors.systemName?.message }]} />
                        <FieldDescription>
                            Give this terminal a unique name so administrators can identify it for approval.
                        </FieldDescription>
                    </Field>

                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        {isPending ? "Connecting..." : "Request Connection"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/50 pb-4 px-0 md:px-6 pt-4 mt-2">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                        onClick={() => openExternalUrl("/")}
                        className="text-primary font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                        Create Organisation
                    </button>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function OrganizationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <OrganizationConnectForm />
        </Suspense>
    )
}
