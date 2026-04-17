import { z } from "zod"

export const ElectionSchema = z.object({
  name: z.string().min(3, "Election name must be at least 3 characters"),
  startTime: z.date({
    message: "Start time is required",
  }),
  endTime: z.date({
    message: "End time is required",
  }),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})
