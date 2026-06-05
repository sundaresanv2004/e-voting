import { z } from "zod"

export const CandidateSchema = z.object({
  name: z.string().min(1, "Candidate name is required").max(100, "Name is too long"),
  electionRoleId: z.string().min(1, "Please select a role"),
  profileImage: z.string().optional().nullable(),
  symbolImage: z.string().optional().nullable(),
})

export type CandidateFormValues = z.infer<typeof CandidateSchema>
