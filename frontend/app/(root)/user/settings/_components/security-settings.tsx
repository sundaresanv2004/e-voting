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
import { Spinner } from "@/components/ui/spinner"

import { updatePasswordAction } from "../_actions"
import { SecuritySchema } from "@/lib/schemas/user"
import { PasswordStrength } from "@/components/auth/password-strength"

type SecurityFormValues = z.infer<typeof SecuritySchema>

import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function SecuritySettings() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
      const response = await updatePasswordAction(values)
      if (response.error) {
        setError("currentPassword", { type: "server", message: response.error })
      } else {
        const params = new URLSearchParams(searchParams)
        params.set("password_changed", "true")
        router.replace(`${pathname}?${params.toString()}`)
        reset()
      }
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="border-border/50 overflow-hidden p-0 w-full">
      <CardHeader className="border-b bg-muted/30 py-4 pb-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Password & Security</CardTitle>
            <CardDescription>Manage your password and secure your account.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="px-6 pt-0 pb-12 space-y-6 w-full">
          <div className="grid gap-6">
            <Field>
              <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/60 w-4 h-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isUpdating}
                  {...register("currentPassword")}
                />
                <InputGroupAddon
                  align="inline-end"
                  className="cursor-pointer"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <HugeiconsIcon icon={showCurrentPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4" />
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[{ message: errors.currentPassword?.message }]} />
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/60 w-4 h-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    disabled={isUpdating}
                    {...register("newPassword")}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <HugeiconsIcon icon={showNewPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4" />
                  </InputGroupAddon>
                </InputGroup>
                <PasswordStrength password={newPasswordValue} />
                <FieldError errors={[{ message: errors.newPassword?.message }]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="text-muted-foreground/60 w-4 h-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    disabled={isUpdating}
                    {...register("confirmPassword")}
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className="cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <HugeiconsIcon icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon} className="h-4 w-4" />
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[{ message: errors.confirmPassword?.message }]} />
              </Field>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-end">
          <Button type="submit" className="gap-2" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner />
                Updating Password...
              </>
            ) : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
