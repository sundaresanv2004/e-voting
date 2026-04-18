import { z } from "zod"

export const VoterIdSchema = z.object({
    uniqueId: z.string().min(2, "Unique ID must be at least 2 characters").max(50, "Unique ID too long")
})
