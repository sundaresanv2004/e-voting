import { z } from "zod"

export const VoterSchema = z.object({
  name: z
    .string()
    .min(1, "Voter name is required")
    .max(150, "Name must be 150 characters or less"),
  uniqueId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
})

export type VoterFormValues = z.infer<typeof VoterSchema>
