"use client"

import * as React from "react"
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
import { useAuth } from "@/components/providers/auth-provider"
import { ProfileSchema } from "@/lib/schemas/user"
import {
  UserIcon,
  Mail01Icon,
  Image01Icon
} from "@hugeicons/core-free-icons"

type ProfileFormValues = z.infer<typeof ProfileSchema>

export function PersonalInfo() {
  const { user: authUser, refreshUser } = useAuth()
  const [isUpdatingName, setIsUpdatingName] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: authUser?.name || ""
    }
  })

  // Sync state when auth user loads
  React.useEffect(() => {
    if (authUser?.name) {
      reset({ name: authUser.name })
    }
  }, [authUser?.name, reset])

  const user = {
    name: authUser?.name || "User",
    email: authUser?.email || "",
    avatar: authUser?.image || "",
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
      // Stub for server action
      console.log("Updating name to:", values.name)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await refreshUser()
      reset({ name: values.name })
      toast.success("Profile updated!")
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleRemoveAvatar = async () => {
    toast.info("Avatar management is coming soon!")
  }

  return (
    <Card className="border-border/50 overflow-hidden p-0 w-full shadow-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b bg-muted/30 py-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Personal Information</CardTitle>
            <CardDescription className="text-xs">Update your personal details and how others see you.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-6 py-8 space-y-8 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-2xl font-black bg-primary/5 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1 w-full text-left">
              <Label className="text-[10px] font-black tracking-[0.2em] text-muted-foreground ml-1 uppercase opacity-60">Profile Picture</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl font-bold h-9"
                  onClick={() => toast.info("Avatar upload is currently disabled")}
                  disabled={isUpdatingName}
                >
                  <HugeiconsIcon icon={Image01Icon} className="h-4 w-4 mr-2" />
                  Change
                </Button>
                {user.avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 h-9 font-bold"
                    onClick={handleRemoveAvatar}
                    disabled={isUpdatingName}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Name</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput
                  id="name"
                  className="rounded-xl bg-muted/30 border-none font-medium text-sm"
                  disabled={isUpdatingName}
                  {...register("name")}
                />
              </InputGroup>
              <FieldError errors={[{ message: errors.name?.message }]} />
            </Field>

            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-60">Email Address</Label>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start" className="bg-transparent border-none">
                  <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 opacity-40" />
                </InputGroupAddon>
                <InputGroupInput 
                   id="email" 
                   defaultValue={user.email} 
                   disabled 
                   className="opacity-50 rounded-xl bg-muted/20 border-none font-medium italic text-xs" 
                />
              </InputGroup>
              <p className="text-[10px] text-muted-foreground/60 font-medium ml-1">Email cannot be changed directly.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-6 px-6 flex justify-end">
          <Button
            type="submit"
            className="rounded-2xl px-8 font-black uppercase tracking-widest text-[11px] h-10 shadow-lg shadow-primary/20"
            disabled={isUpdatingName || !isDirty}
          >
            {isUpdatingName ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
