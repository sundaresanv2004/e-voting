import { z } from "zod"

export const OrganizationSchema = z.object({
  name: z.string().min(3, {
    message: "Valid organization name is required",
  }),
  type: z.enum(["SCHOOL", "COLLEGE", "OTHER"], {
    message: "Please select an organization type",
  }),
  logo: z.string().optional(),
})

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>


