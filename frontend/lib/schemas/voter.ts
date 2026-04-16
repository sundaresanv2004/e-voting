import { z } from "zod"

export const VoterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  uniqueId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  additionalDetails: z.any().optional(),
})


export type VoterFormValues = z.infer<typeof VoterSchema>
