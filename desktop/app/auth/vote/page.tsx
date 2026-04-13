"use client"

import React, { useState, useTransition } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Zod validation strictly for UI phase requests based on logic in elections/_actions.ts
const ElectionCodeSchema = z.object({
    electionCode: z.string()
        .min(1, "Election code is required.")
        .regex(/^[A-Z0-9]{2,4}-[A-Z0-9]{6}$/, "Invalid format. Expected {PREFIX}-{CODE} (e.g. RAJP-X8Y9Z2)")
})

type ElectionCodeValues = z.infer<typeof ElectionCodeSchema>

export default function VoteAuthPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ElectionCodeValues>({
        resolver: zodResolver(ElectionCodeSchema),
        defaultValues: {
            electionCode: "",
        }
    })

    const onSubmit = (values: ElectionCodeValues) => {
        setError(null)
        startTransition(async () => {
            // Mock backend validation delay to show UI spinner
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Just for UI testing - no backend exists yet!
            if (values.electionCode === "TEST-CODE") {
                console.log("Valid code ready for backend:", values.electionCode)
                // router.push("/vote/session")
            } else {
                // If they don't type TEST-CODE, throw the validation UI error
                setError(`The election code "${values.electionCode}" is invalid or has expired. Try typing "TEST-CODE" for testing.`)
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Start Voting</CardTitle>
                <CardDescription>Enter the secure election code provided by your organisation to initialize this voting terminal.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 space-y-4 md:px-6 mb-2">
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
                        <FieldLabel htmlFor="electionCode">Election Code</FieldLabel>
                        <Input
                            id="electionCode"
                            placeholder="e.g. RAJP-X8Y9Z2"
                            type="text"
                            autoComplete="off"
                            className="uppercase font-mono"
                            disabled={isPending}
                            {...register("electionCode", {
                                onChange: (e) => { e.target.value = e.target.value.toUpperCase() }
                            })}
                        />
                        <FieldError errors={[{ message: errors.electionCode?.message }]} />
                        <FieldDescription>
                            All codes are uppercase and provided securely by your election administrator.
                        </FieldDescription>
                    </Field>

                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                        {isPending && <Spinner className="h-4 w-4" />}
                        {isPending ? "Validating Session..." : "Initialize Session"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
