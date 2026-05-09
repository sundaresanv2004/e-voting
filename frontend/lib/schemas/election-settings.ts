import { z } from "zod"

export const ElectionSettingsUpdateSchema = z.object({
  allowOnlineVoting: z.boolean().optional(),
  allowOfflineVoting: z.boolean().optional(),
  authorizeVoters: z.boolean().optional(),
  showCandidateProfiles: z.boolean().optional(),
  showCandidateSymbols: z.boolean().optional(),
  shuffleCandidates: z.boolean().optional(),
  allowMultipleVotes: z.boolean().optional(),
  allowNota: z.boolean().optional(),
  maxVotesPerUser: z.number().int().min(1).max(10).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "No settings were provided",
}).superRefine((data, ctx) => {
  if (data.allowOnlineVoting && data.allowOfflineVoting) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["allowOnlineVoting"],
      message: "Online voting and hardware-app voting cannot both be enabled",
    })
  }

  if (data.allowOnlineVoting && data.authorizeVoters === false) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["authorizeVoters"],
      message: "Voter authorization is required when online voting is enabled",
    })
  }
})

export type ElectionSettingsUpdateValues = z.infer<typeof ElectionSettingsUpdateSchema>
