import { z } from "zod"

export const OrganizationSchema = z.object({
  name: z.string().min(3, {
    message: "Valid organization name is required",
  }),
  type: z.enum(["SCHOOL", "COLLEGE", "OTHER"], {
    message: "Please select an organization type",
  }),
  logo: z.url().optional().or(z.literal("")),
}).strict() // D1: reject unknown fields to prevent mass-assignment

export const OrganizationSettingsSchema = z.object({
  maxElections: z.number().int().min(1).max(100),
  maxMembers: z.number().int().min(1).max(1000),
  allowCustomBranding: z.boolean(),
}).strict()

export type OrganizationFormValues = z.infer<typeof OrganizationSchema>
export type OrganizationSettingsValues = z.infer<typeof OrganizationSettingsSchema>

