"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { updateUserProfileAction, updateUserImageAction } from "../_actions"
import { AvatarDialog } from "./avatar-dialog"
import { ProfileSchema } from "@/lib/schemas/user"
import {
  UserIcon,
  Mail01Icon,
  Image01Icon
} from "@hugeicons/core-free-icons"

type ProfileFormValues = z.infer<typeof ProfileSchema>

export function PersonalInfo() {
  const { data: session, update: updateSession } = useSession()
  const [isUpdatingName, setIsUpdatingName] = React.useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: session?.user?.name || ""
    }
  })

  // Sync state when session loads
  React.useEffect(() => {
    if (session?.user?.name) {
      reset({ name: session.user.name })
    }
  }, [session?.user?.name, reset])

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const onSubmit = async (values: ProfileFormValues) => {
    setIsUpdatingName(true)
    try {
      const response = await updateUserProfileAction(values.name)
      if (response.error) {
        toast.error(response.error)
        return
      }
      await updateSession()
      reset({ name: values.name })
      toast.success(response.success || "Profile updated!")
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleUpdateAvatar = async (imageUrl: string) => {
    try {
      await updateUserImageAction(imageUrl)
      await updateSession()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update profile picture")
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      await updateUserImageAction(null)
      await updateSession()
      toast.success("Profile picture removed")
    } catch (error) {
      console.error(error)
      toast.error("Failed to remove profile picture")
    }
  }

  return (
    <Card className="border-border/50 overflow-hidden p-0 w-full">
      <CardHeader className="border-b bg-muted/30 py-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Update your personal details and how others see you.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-6 pt-0 pb-6 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 border-2">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-xs tracking-wider text-muted-foreground ml-1 uppercase">Profile Picture</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAvatarDialogOpen(true)}
                  disabled={isUpdatingName}
                >
                  <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" />
                  Change Avatar
                </Button>
                {user.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveAvatar}
                    disabled={isUpdatingName}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="name"
                  disabled={isUpdatingName}
                  {...register("name")}
                />
              </InputGroup>
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <InputGroup className="h-9">
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={Mail01Icon} />
                </InputGroupAddon>
                <InputGroupInput id="email" defaultValue={user.email} disabled className="opacity-70" />
              </InputGroup>
              <p className="text-[11px] text-muted-foreground">Email cannot be changed directly. Contact support if needed.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
          <Button
            type="submit"
            disabled={isUpdatingName || !isDirty}
          >
            {isUpdatingName ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>

      <AvatarDialog
        isOpen={isAvatarDialogOpen}
        onClose={() => setIsAvatarDialogOpen(false)}
        currentImage={user.avatar}
        onSave={handleUpdateAvatar}
      />
    </Card>
  )
}
