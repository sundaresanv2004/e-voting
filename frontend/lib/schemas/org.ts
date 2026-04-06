import { z } from "zod"

export const OrganizationSchema = z.object({
  name: z.string().min(3, {
    message: "Valid organization name is required",
  }),
  type: z.enum(["SCHOOL", "COLLEGE", "OTHER"]),
})

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>