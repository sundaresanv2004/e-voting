"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, UniversityIcon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createOrganization } from "@/lib/actions/org"
import { OrganizationSchema, OrganizationFormValues } from "@/lib/schemas/org"
import { ImageUpload } from "@/components/ui/image-upload"

function CreateOrganizationForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string>("")

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(OrganizationSchema),
        defaultValues: {
            name: "",
            type: undefined as any,
            logo: ""
        }
    })

    const onSubmit = async (values: OrganizationFormValues) => {
        setIsSubmitting(true)
        setErrorMsg("")

        try {
            const result = await createOrganization(values)

            if (!result.success || !result.data) {
                setErrorMsg(result.error || "Failed to create organization.")
                setIsSubmitting(false)
                return
            }

            // Set the active organization in Better Auth client session
            await authClient.organization.setActive({
                organizationId: result.data.id
            })

            toast.success("Organization created successfully!")
            router.push("/organisation")
        } catch (err) {
            setErrorMsg("An unexpected error occurred.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            {errorMsg && (
                <Alert variant="destructive" className="mb-4 flex items-center py-3 border-destructive/20 bg-destructive/5 rounded-2xl">
                    <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 text-destructive mb-1" />
                    <AlertDescription className="text-destructive ml-2">{errorMsg}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Field data-invalid={!!errors.name}>
                        <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                        <Input
                            id="name"
                            placeholder="Acme Corp"
                            aria-invalid={!!errors.name}
                            {...register("name")}
                        />
                        {errors.name && (
                            <FieldError>{errors.name.message}</FieldError>
                        )}
                    </Field>

                    <Field data-invalid={!!errors.type}>
                        <FieldLabel htmlFor="type">Organization Type</FieldLabel>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isSubmitting}
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
                        {errors.type && (
                            <FieldError>{errors.type.message}</FieldError>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel>Organization Logo <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FieldLabel>
                        <Controller
                            name="logo"
                            control={control}
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    onUploadingChange={setIsUploadingLogo}
                                    disabled={isSubmitting}
                                    variant="rectangle"
                                    folder="org-logos"
                                />
                            )}
                        />
                    </Field>
                </FieldGroup>

                <Button 
                    type="submit" 
                    className="w-full gap-2 mt-6 mb-4" 
                    disabled={isSubmitting || isUploadingLogo}
                >
                    {isUploadingLogo ? (
                        <>
                            <Spinner />
                            Uploading logo...
                        </>
                    ) : isSubmitting ? (
                        <>
                            <Spinner />
                            Creating...
                        </>
                    ) : (
                        "Create Organization"
                    )}
                </Button>
            </form>
        </div>
    )
}

export default function CreateOrganizationPage() {
    return (
        <Card className="w-full border-none ring-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card md:p-2 backdrop-blur-3xl bg-background/50">
            <CardHeader className="text-center pt-0 md:pt-6 px-0 md:px-6">
                <CardTitle className="text-2xl font-bold">Organization Setup</CardTitle>
                <CardDescription>To get started, you need to be part of an organization.</CardDescription>
            </CardHeader>

            <CardContent className="px-0 md:px-6">
                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="create" className="flex items-center gap-2">
                            <HugeiconsIcon icon={UniversityIcon} className="w-4 h-4" />
                            Create New
                        </TabsTrigger>
                        <TabsTrigger value="join" className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                            Join Existing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="space-y-4 mt-2">
                        <CreateOrganizationForm />
                    </TabsContent>

                    <TabsContent value="join" className="py-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-muted">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-12 h-12 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Join an Organization</h3>
                            <p className="text-sm text-muted-foreground max-w-[320px] mx-auto">
                                To join an existing organization, please contact your election administrator or organization owner.
                            </p>
                        </div>
                        <Alert className="bg-primary/5 border-primary/20 flex gap-3 text-left p-4 rounded-xl items-start">
                            <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h5 className="font-medium text-sm leading-none">Administrator Required</h5>
                                <AlertDescription className="text-sm text-muted-foreground">
                                    Only administrators can add new members to an organization.
                                </AlertDescription>
                            </div>
                        </Alert>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
