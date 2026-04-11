"use client"

import * as React from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  ShieldKeyIcon,
  ViewIcon,
  ViewOffSlashIcon
} from "@hugeicons/core-free-icons"

import { SecuritySchema } from "@/lib/schemas/user"
import { PasswordStrength } from "@/components/auth/password-strength"

type SecurityFormValues = z.infer<typeof SecuritySchema>

export function SecuritySettings() {
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors }
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(SecuritySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const newPasswordValue = watch("newPassword")

  const onSubmit = async (values: SecurityFormValues) => {
    setIsUpdating(true)
    try {
      // Stub for server action
      console.log("Updating password...", values)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Password updated!")
      reset()
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="border-border/50 overflow-hidden p-0 w-full shadow-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b bg-muted/30 py-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Password & Security</CardTitle>
            <CardDescription className="text-xs">Manage your password and secure your account.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-6 py-8 space-y-8 w-full">
          <div className="grid gap-6">
            <Field>
              <FieldLabel htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Password</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start" className="bg-transparent border-none">
                  <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/40 w-4 h-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="rounded-xl bg-muted/30 border-none font-medium text-sm"
                  disabled={isUpdating}
                  {...register("currentPassword")}
                />
                <InputGroupAddon
                  align="inline-end"
                  className="cursor-pointer bg-transparent border-none mr-2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <HugeiconsIcon icon={showCurrentPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity" />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[{ message: errors.currentPassword?.message }]} />
            </Field>

            <div className="grid gap-8 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest opacity-60">New Password</FieldLabel>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start" className="bg-transparent border-none">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/40 w-4 h-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="rounded-xl bg-muted/30 border-none font-medium text-sm"
                    disabled={isUpdating}
                    {...register("newPassword")}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer bg-transparent border-none mr-2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <HugeiconsIcon icon={showNewPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity" />
                  </InputGroupAddon>
                </InputGroup>
                <PasswordStrength password={newPasswordValue} />
                <FieldError errors={[{ message: errors.newPassword?.message }]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest opacity-60">Confirm New Password</FieldLabel>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start" className="bg-transparent border-none">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/40 w-4 h-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    className="rounded-xl bg-muted/30 border-none font-medium text-sm"
                    disabled={isUpdating}
                    {...register("confirmPassword")}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer bg-transparent border-none mr-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <HugeiconsIcon icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity" />
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[{ message: errors.confirmPassword?.message }]} />
              </Field>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-6 px-6 flex justify-end">
          <Button type="submit" disabled={isUpdating} className="rounded-2xl px-8 font-black uppercase tracking-widest text-[11px] h-10 shadow-lg shadow-primary/20">
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
