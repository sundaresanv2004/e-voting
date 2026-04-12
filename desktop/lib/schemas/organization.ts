import { z } from "zod"

export const OrganizationConnectSchema = z.object({
  organizationCode: z.string().min(1, {
    message: "Organisation code is required to connect.",
  }),
  systemName: z.string().min(1, {
    message: "A unique system name is required for identification.",
  }),
})

export type OrganizationConnectValues = z.infer<typeof OrganizationConnectSchema>
