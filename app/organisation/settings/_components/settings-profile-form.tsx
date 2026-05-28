"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError, FieldContent, FieldDescription } from "@/components/ui/field"

import { updateOrganizationProfile } from "@/lib/actions/settings"
import { OrganizationType } from "@prisma/client"

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(OrganizationType),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof ProfileSchema>

interface SettingsProfileFormProps {
  organization: {
    id: string
    name: string
    type: OrganizationType
    logo?: string | null
    code: string
  }
}

export function SettingsProfileForm({ organization }: SettingsProfileFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: organization.name,
      type: organization.type,
      logo: organization.logo || "",
    },
  })

  const typeValue = watch("type")

  const onSubmit = async (data: ProfileFormValues) => {
    setIsPending(true)
    try {
      const res = await updateOrganizationProfile(
        data.name,
        data.type,
        data.logo || undefined
      )

      if (!res.success) {
        toast.error(res.error || "Failed to update profile")
      } else {
        toast.success("Organization profile updated")
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(organization.code)
    toast.success("Organization code copied to clipboard")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Read-only Code Section */}
      <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
        <Label>Organization Code</Label>
        <p className="text-sm text-muted-foreground mb-2">
          This code can be shared with members if they need to identify the organization.
        </p>
        <div className="flex items-center max-w-sm gap-2">
          <Input value={organization.code} readOnly className="bg-muted font-mono" />
          <Button type="button" variant="outline" size="icon" onClick={handleCopyCode}>
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field data-invalid={!!errors.name}>
          <FieldLabel>Organization Name</FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input placeholder="Enter organization name" {...field} />
              )}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.type}>
          <FieldLabel>Organization Type</FieldLabel>
          <FieldContent>
            <Select
              value={typeValue}
              onValueChange={(val: any) => setValue("type", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="COLLEGE">College / University</SelectItem>
                <SelectItem value="OTHER">Other Organization</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <FieldError>{errors.type.message}</FieldError>}
          </FieldContent>
        </Field>
      </div>

      <Field data-invalid={!!errors.logo}>
        <FieldLabel>Logo URL</FieldLabel>
        <FieldDescription>
          Provide a valid URL for your organization's logo image.
        </FieldDescription>
        <FieldContent className="max-w-xl">
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <Input placeholder="https://example.com/logo.png" {...field} />
            )}
          />
          {errors.logo && <FieldError>{errors.logo.message}</FieldError>}
        </FieldContent>
      </Field>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
