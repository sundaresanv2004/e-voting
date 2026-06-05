"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { FieldGroup } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/auth/password-strength"
import { changePasswordAction } from "@/lib/actions/profile"
import { useSession } from "@/lib/auth-client"

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  })

type PasswordValues = z.infer<typeof PasswordSchema>

function PasswordInput({
  id,
  placeholder,
  disabled,
  ...rest
}: React.ComponentProps<typeof InputGroupInput> & { id: string; placeholder?: string }) {
  const [show, setShow] = React.useState(false)

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder || "••••••••"}
        disabled={disabled}
        {...rest}
      />
      <InputGroupAddon align="inline-end">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={show ? ViewOffSlashIcon : EyeIcon}
            strokeWidth={2}
            className="size-4 text-muted-foreground hover:text-foreground transition-colors"
          />
        </button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function SecurityTab({ hasPasswordAccount }: { hasPasswordAccount: boolean }) {
  const { data: session } = useSession()
  const [newPassword, setNewPassword] = React.useState("")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(PasswordSchema),
  })

  // Watch new password for strength indicator
  React.useEffect(() => {
    const sub = watch((val) => setNewPassword(val.newPassword ?? ""))
    return () => sub.unsubscribe()
  }, [watch])

  const onSubmit = async (values: PasswordValues) => {
    const result = await changePasswordAction(values)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      reset()
      setNewPassword("")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change Password */}
      <Card className="overflow-hidden p-0 gap-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>
                Update your password. You&apos;ll be signed out of other sessions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="px-6 py-6">
            {!hasPasswordAccount ? (
              <Alert variant="info">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 text-blue-500" />
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">
                  Your account was created with <strong>Google</strong> (or another social login) and does not have a password set. Password management is not available
                  for social accounts. However, you can set a password by using the <strong>Forgot Password</strong> option.
                </AlertDescription>
              </Alert>
            ) : (
              <FieldGroup className="flex flex-col gap-5 max-w-md">
                {/* Current password */}
                <Field data-invalid={!!errors.currentPassword}>
                  <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                  <PasswordInput
                    id="currentPassword"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.currentPassword}
                    {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                    <FieldError>{errors.currentPassword.message}</FieldError>
                  )}
                </Field>

                {/* New password */}
                <Field data-invalid={!!errors.newPassword}>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <PasswordInput
                    id="newPassword"
                    placeholder="Min 8 characters"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.newPassword}
                    {...register("newPassword")}
                  />
                  <PasswordStrength password={newPassword} />
                  {errors.newPassword && (
                    <FieldError>{errors.newPassword.message}</FieldError>
                  )}
                </Field>

                {/* Confirm password */}
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            )}
          </CardContent>

          {hasPasswordAccount && (
            <CardFooter className="px-6 pb-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Changing…
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

    </div>
  )
}
