import { z } from "zod"

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100, "Role name is too long"),
  order: z.number({ message: "Priority order is required" }).min(1, "Priority order must be at least 1"),
  allSystems: z.boolean(),
  systemIds: z.array(z.string()),
}).refine(data => data.allSystems || data.systemIds.length > 0, {
  message: "Please select at least 1 specific system",
  path: ["systemIds"],
})

export type RoleFormValues = z.infer<typeof RoleSchema>
