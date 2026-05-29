"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { OrganizationType } from "@prisma/client"
import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, Image01Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Separator } from "@/components/ui/separator"

import { updateOrganizationProfile } from "@/lib/actions/settings"
import { OrganizationCodeSection } from "./organization-code-section"

// ── Schemas ──────────────────────────────────────────────────────────────────

const IdentitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(OrganizationType),
})

const LogoSchema = z.object({
  logo: z.string().optional(),
})

type IdentityFormValues = z.infer<typeof IdentitySchema>
type LogoFormValues = z.infer<typeof LogoSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface SettingsProfileFormProps {
  organization: {
    id: string
    name: string
    type: OrganizationType
    logo?: string | null
    code: string
    settings?: {
      allowCustomBranding: boolean
    } | null
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsProfileForm({ organization }: SettingsProfileFormProps) {
  const router = useRouter()

  // ── Identity form ──────────────────────────────────────────────────────────
  const [identityPending, setIdentityPending] = React.useState(false)

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(IdentitySchema),
    defaultValues: {
      name: organization.name,
      type: organization.type,
    },
  })

  React.useEffect(() => {
    identityForm.reset({
      name: organization.name,
      type: organization.type,
    })
  }, [organization.name, organization.type, identityForm])

  const onIdentitySubmit = async (data: IdentityFormValues) => {
    setIdentityPending(true)
    try {
      const res = await updateOrganizationProfile(data.name, data.type, organization.logo ?? undefined)
      if (!res.success) {
        toast.error(res.error || "Failed to update organization details")
      } else {
        toast.success("Organization details updated")
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIdentityPending(false)
    }
  }

  // ── Logo form ──────────────────────────────────────────────────────────────
  const [logoPending, setLogoPending] = React.useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)

  const logoForm = useForm<LogoFormValues>({
    defaultValues: {
      logo: organization.logo ?? "",
    },
  })

  React.useEffect(() => {
    logoForm.reset({
      logo: organization.logo ?? "",
    })
  }, [organization.logo, logoForm])

  const onLogoSubmit = async (data: LogoFormValues) => {
    setLogoPending(true)
    try {
      const res = await updateOrganizationProfile(organization.name, organization.type, data.logo || undefined)
      if (!res.success) {
        toast.error(res.error || "Failed to update logo")
      } else {
        toast.success("Organization logo updated")
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLogoPending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Card 1: Identity ──────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b flex flex-row items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={Building03Icon} className="size-4" />
          </div>
          <div>
            <CardTitle>Organization Identity</CardTitle>
            <CardDescription>
              Update your organization's display name and category type.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)}>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <Field className="max-w-md" data-invalid={!!identityForm.formState.errors.name}>
              <FieldLabel>Organization Name</FieldLabel>
              <FieldContent>
                <Controller
                  control={identityForm.control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      placeholder="Acme Corp"
                      className="max-w-md w-full"
                      {...field}
                    />
                  )}
                />
                {identityForm.formState.errors.name && (
                  <FieldError>{identityForm.formState.errors.name.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            <Field className="max-w-sm" data-invalid={!!identityForm.formState.errors.type}>
              <FieldLabel>Organization Type</FieldLabel>
              <FieldContent>
                <Controller
                  control={identityForm.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Type</SelectLabel>
                          <SelectItem value="SCHOOL">School</SelectItem>
                          <SelectItem value="COLLEGE">College / University</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {identityForm.formState.errors.type && (
                  <FieldError>{identityForm.formState.errors.type.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          </CardContent>

          <CardFooter className="justify-end pt-0">
            <Button type="submit" disabled={identityPending || !identityForm.formState.isDirty}>
              {identityPending ? "Saving…" : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── Card 2: Logo ──────────────────────────────────────────── */}
      <Card className={cn(!organization.settings?.allowCustomBranding && "pb-0")}>
        <CardHeader className="border-b flex flex-row items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={Image01Icon} className="size-4" />
          </div>
          <div>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>
              Upload a logo that represents your organization. It will be shown on voting pages when custom branding is enabled.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={logoForm.handleSubmit(onLogoSubmit)}>
          <CardContent>
            <div className="max-w-md">
              <Controller
                control={logoForm.control}
                name="logo"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onUploadingChange={setIsUploadingLogo}
                    disabled={logoPending}
                    variant="rectangle"
                    folder="org-logos"
                  />
                )}
              />
            </div>
          </CardContent>

          <CardFooter className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-4",
            !organization.settings?.allowCustomBranding
              ? "border-t px-6 !py-4 bg-amber-50/50 mt-6 dark:bg-amber-950/20 text-sm text-amber-800 dark:text-amber-300"
              : "justify-end pt-0"
          )}>
            {!organization.settings?.allowCustomBranding && (
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Custom branding is disabled. Enable it to show your logo in every place.</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={logoPending || isUploadingLogo || !logoForm.formState.isDirty}
              className={cn(!organization.settings?.allowCustomBranding && "sm:ml-auto w-full sm:w-auto")}
            >
              {isUploadingLogo ? "Uploading…" : logoPending ? "Saving…" : "Save Logo"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── Card 3: Organization Access Code ──────────────────────── */}
      <OrganizationCodeSection code={organization.code} />
    </div>
  )
}
