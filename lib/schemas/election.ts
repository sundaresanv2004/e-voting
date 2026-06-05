import { z } from "zod"

export const ElectionSchema = z.object({
  name: z.string().min(3, "Election name must be at least 3 characters").max(100),
  startTime: z.date(),
  endTime: z.date(),
}).strict() // D1: reject unknown fields
.refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export type ElectionFormValues = z.infer<typeof ElectionSchema>
