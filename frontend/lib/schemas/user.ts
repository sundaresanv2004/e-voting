import { z } from "zod"

export const ProfileSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
})

export const SecuritySchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters",
  }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password cannot be the same as the current password",
  path: ["newPassword"],
})
