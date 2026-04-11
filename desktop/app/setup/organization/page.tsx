"use client"

import React, { useState, useTransition } from "react"
import { invoke } from "@tauri-apps/api/core"
import { HugeiconsIcon } from '@hugeicons/react'
import { UserGroupIcon, Alert01Icon, UniversityIcon, Location01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { OrganizationSchema, OrganizationFormValues } from "@/lib/schemas/org"
import { api } from "@/lib/api"
import { useAuth } from "@/components/providers/auth-provider"
import { saveSystemData } from "@/lib/store"

export default function OrganizationSetupPage() {
    const { refreshUser } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(OrganizationSchema),
        defaultValues: {
            name: "",
            type: undefined
        }
    })

    const onSubmit = (values: OrganizationFormValues) => {
        setError(null)

        startTransition(async () => {
            try {
                let macAddress = "UNKNOWN"
                try {
                    macAddress = await invoke<string>("get_system_mac_address")
                } catch (e) {
                    console.error("Failed to fetch hardware identity:", e)
                }

                interface SetupResponse {
                    organization: { id: string }
                    system: { 
                        id: string
                        type: "ADMIN" | "VOTE"
                        token: string
                        expiresAt: string
                    }
                }

                const response = await api.post<SetupResponse>("/organizations/", {
                    ...values,
                    macAddress
                })

                // Save system identity to local store
                if (response.system && response.organization) {
                    try {
                        await saveSystemData({
                            systemId: response.system.id,
                            organizationId: response.organization.id,
                            systemType: response.system.type,
                            accessToken: response.system.token,
                            expiresAt: response.system.expiresAt
                        })
                    } catch (e) {
                        console.error("Failed to save terminal identity:", e)
                        // Don't block redirect, but warn
                        toast.warning("Organization created, but failed to save terminal identity.")
                    }
                }

                toast.success("Organization created successfully!")

                // Refresh the local user state
                await refreshUser()
                
                // Navigate to the admin dashboard with a small delay for state settling
                setTimeout(() => {
                    router.replace('/admin/organization')
                }, 1000)
                
            } catch (err: any) {
                console.error("Setup error:", err)
                setError(err.detail || 'An unexpected error occurred. Please try again.')
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
                            <HugeiconsIcon icon={UniversityIcon} className="w-4 h-4" />
                            Create New
                        </TabsTrigger>
                        <TabsTrigger value="join" className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                            Join Existing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4">
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
                                <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <HugeiconsIcon icon={Location01Icon} className="w-4 h-4" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="name"
                                        placeholder="e.g. Stanford University"
                                        disabled={isPending}
                                        {...register("name")}
                                    />
                                </InputGroup>
                                <FieldError errors={[{ message: errors.name?.message }]} />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="type">Organization Type</FieldLabel>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isPending}
                                        >
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
                                    )}
                                />
                                <FieldError errors={[{ message: errors.type?.message }]} />
                            </Field>

                            <div className="flex justify-center py-2 mb-4">
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending && <Spinner className="h-4 w-4" />}
                                    {isPending ? "Creating Organization..." : "Create Organization"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="join" className="py-4 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-muted">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Join an Organization</h3>
                            <p className="text-sm text-muted-foreground/80 max-w-[320px] mx-auto">
                                To join an existing organization, please contact your election administrator or organization owner.
                            </p>
                        </div>
                        <Alert variant={"info"}>
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-info" />
                            <AlertDescription className="text-sm">
                                Only administrators can add new members to an organization.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
