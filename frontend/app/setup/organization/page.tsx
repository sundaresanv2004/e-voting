"use client"

import React, { useState, useTransition } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Building01Icon,
    UserGroupIcon,
    Alert01Icon,
} from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { toast } from "sonner"
import { createOrganization } from "@/lib/actions/org-actions"

export default function OrganizationSetupPage() {
    const { update } = useSession()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            try {
                const result = await createOrganization(formData)

                if (!result.success) {
                    setError(result.error || "An error occurred")
                    return
                }

                // Show a sleek success notification
                toast.success("Organization created!")

                // Update the session to include the new organizationId and role
                await update()

                // Hard reload to ensure the middleware picks up the new session cookie
                window.location.href = '/dashboard'
            } catch (err) {
                console.error("Setup error:", err)
                setError('An unexpected error occurred. Please try again.')
            }
        })
    }

    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Organization Setup</CardTitle>
                <CardDescription>To get started, you need to be part of an organization.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="create" className="flex items-center gap-2">
                            <HugeiconsIcon icon={Building01Icon} className="w-4 h-4" />
                            Create New
                        </TabsTrigger>
                        <TabsTrigger value="join" className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                            Join Existing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4">
                        <form onSubmit={onSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                                    <AlertDescription className="text-destructive">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Field>
                                <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <HugeiconsIcon icon={Building01Icon} className="w-4 h-4" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="e.g. Stanford University"
                                    />
                                </InputGroup>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="type">Organization Type</FieldLabel>
                                <Select name="type" required>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Organization Type</SelectLabel>
                                            <SelectItem value="SCHOOL">School</SelectItem>
                                            <SelectItem value="COLLEGE">College</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className="flex justify-center py-2 mb-4">
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending && <Spinner className="h-4 w-4" />}
                                    Create Organization
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="join" className="py-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-muted">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-12 h-12 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Join an Organization</h3>
                            <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
                                To join an existing organization, please contact your election administrator or organization owner.
                            </p>
                        </div>
                        <Alert className="bg-muted/50 border-muted">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-muted-foreground" />
                            <AlertDescription className="text-xs text-muted-foreground">
                                Only administrators can add new members to an organization.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
