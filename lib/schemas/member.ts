import { z } from "zod"

export const AddMemberSearchSchema = z.object({
  query: z.string().min(3, "Enter at least 3 characters to search"),
})

export const MemberPermissionsSchema = z.object({
  role: z.enum(["org_admin", "staff", "viewer"], {
    message: "Please select a role",
  }),
  hasAllAccess: z.boolean(),
  electionIds: z.array(z.string()),
}).refine(
  (data) =>
    data.hasAllAccess ||
    data.role === "org_admin" ||
    data.electionIds.length > 0,
  {
    message: "Select at least one election, or enable full election access",
    path: ["electionIds"],
  }
)

export type AddMemberSearchValues = z.infer<typeof AddMemberSearchSchema>
export type MemberPermissionsValues = z.infer<typeof MemberPermissionsSchema>
