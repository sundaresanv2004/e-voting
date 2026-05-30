import { z } from "zod"

export const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  roleIds: z.array(z.string()),
})

export type CategoryFormValues = z.infer<typeof CategorySchema>
