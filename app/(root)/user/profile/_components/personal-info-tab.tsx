"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Mail01Icon,
  Image01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import { useSession, authClient } from "@/lib/auth-client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FieldGroup } from "@/components/ui/field"
import { AvatarUploadDialog } from "./avatar-upload-dialog"
import { updateUserNameAction, updateUserAvatarAction } from "@/lib/actions/profile"

const ProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),
})
type ProfileValues = z.infer<typeof ProfileSchema>

interface PersonalInfoTabProps {
  profile: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export function PersonalInfoTab({ profile }: PersonalInfoTabProps) {
  const { data: session, refetch } = useSession()
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = React.useState(false)
  const [isRemovingAvatar, setIsRemovingAvatar] = React.useState(false)

  // Use live session data if available, fall back to server-fetched profile
  const currentName = session?.user?.name ?? profile.name
  const currentEmail = session?.user?.email ?? profile.email
  const currentImage = session?.user?.image ?? profile.image

  const initials = (currentName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: currentName },
  })

  // Sync form when session loads
  React.useEffect(() => {
    if (currentName) {
      reset({ name: currentName })
    }
  }, [currentName, reset])

  const onSubmit = async (values: ProfileValues) => {
    const result = await updateUserNameAction(values.name)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      reset({ name: values.name })
      // Update local Better Auth session cache instantly
      await authClient.updateUser({ name: values.name })
      if (refetch) await refetch()
    }
  }

  const handleSaveAvatar = async (imageUrl: string) => {
    const result = await updateUserAvatarAction(imageUrl)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      // Update local Better Auth session cache instantly
      await authClient.updateUser({ image: imageUrl })
      if (refetch) await refetch()
    }
  }

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true)
    try {
      const result = await updateUserAvatarAction(null)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        // Update local Better Auth session cache instantly
        await authClient.updateUser({ image: "" })
        if (refetch) await refetch()
      }
    } finally {
      setIsRemovingAvatar(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Picture Card */}
      <Card className="overflow-hidden p-0 gap-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Profile Picture</CardTitle>
              <CardDescription>Update your avatar that others see across the platform.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="size-24 border-2 border-border/50 shadow-sm">
              <AvatarImage src={currentImage || undefined} alt={currentName} />
              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3 flex-1 sm:pt-2">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                Choose a square image for best results. Max size 10 MB.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAvatarDialogOpen(true)}
                  disabled={isRemovingAvatar}
                >
                  <HugeiconsIcon icon={Image01Icon} data-icon="inline-start" strokeWidth={2} />
                  {currentImage ? "Change Avatar" : "Upload Avatar"}
                </Button>
                {currentImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar}
                  >
                    {isRemovingAvatar ? (
                      <>
                        <Spinner />
                        Removing…
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Delete01Icon} data-icon="inline-start" strokeWidth={2} />
                        Remove
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Form Card */}
      <Card className="overflow-hidden p-0 gap-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your name and view your account details.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-6 py-6">
            <FieldGroup className="grid gap-6 md:grid-cols-2">
              {/* Name field */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="name"
                    placeholder="Your display name"
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                </InputGroup>
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              {/* Email — read only */}
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    value={currentEmail}
                    disabled
                    className="opacity-60"
                  />
                </InputGroup>
                <FieldDescription>
                  Email cannot be changed directly. Contact support if needed.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="pl-6 pb-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty} className="gap-2">
              {isSubmitting ? (
                <>
                  <Spinner />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Avatar Upload Dialog */}
      <AvatarUploadDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        currentImage={currentImage}
        onSave={handleSaveAvatar}
      />
    </div>
  )
}
