"use client"

import React, { useState, useTransition } from "react"
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
                // In a real Tauri app, we'd fetch the MAC address here using a Rust command
                // For now, we'll send a placeholder or fetch hostname if available
                let macAddress = "MOCK-MAC-ADDRESS-123"
                
                try {
                    // Try to get some device info if @tauri-apps/api is available
                    const { invoke } = await import("@tauri-apps/api/core")
                    // If you have a custom command, use it here:
                    // macAddress = await invoke("get_mac_address")
                } catch (e) {
                    console.warn("Could not fetch system info:", e)
                }

                const response = await api.post("/organizations/", {
                    ...values,
                    macAddress
                })

                toast.success("Organization created!")

                // Refresh the local user state to pick up the new organizationId and role
                await refreshUser()

                // Navigate to the admin dashboard
                router.push('/admin/organization')
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
                    <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="create" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <HugeiconsIcon icon={UniversityIcon} className="w-4 h-4" />
                            Create New
                        </TabsTrigger>
                        <TabsTrigger value="join" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                            Join Existing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4 outline-none">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="flex items-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl">
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
                                            <SelectTrigger id="type" className="rounded-xl h-11 border-border/50">
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
                                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isPending}>
                                    {isPending && <Spinner className="h-4 w-4 mr-2" />}
                                    {isPending ? "Creating Organization..." : "Create Organization"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="join" className="py-8 text-center space-y-6 outline-none">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-muted/50">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Join an Organization</h3>
                            <p className="text-sm text-muted-foreground/80 max-w-[320px] mx-auto">
                                To join an existing organization, please contact your election administrator or organization owner.
                            </p>
                        </div>
                        <Alert className="bg-primary/5 border-primary/10 rounded-2xl">
                            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-primary mb-1" />
                            <AlertDescription className="text-xs text-primary/80">
                                Only administrators can add new members to an organization.
                            </AlertDescription>
                        </Alert>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
