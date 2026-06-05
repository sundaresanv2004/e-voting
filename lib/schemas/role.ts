import { z } from "zod"

export const RoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be 100 characters or less"),
  order: z
    .number({ message: "Priority order must be a valid number" })
    .int("Priority order must be a whole number")
    .min(1, "Priority order must be at least 1"),
  categoryIds: z.array(z.string()),
})

export type RoleFormValues = z.infer<typeof RoleSchema>
