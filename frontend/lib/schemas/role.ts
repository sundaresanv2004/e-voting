import { z } from "zod"

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100, "Role name is too long"),
  order: z.number().min(1, "Priority order must be at least 1"),
  allSystems: z.boolean(),
  systemIds: z.array(z.string()),
})

export type RoleFormValues = z.infer<typeof RoleSchema>
