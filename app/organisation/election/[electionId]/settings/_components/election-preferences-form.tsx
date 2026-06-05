"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, Shield01Icon, UserMultipleIcon, SecurityCheckIcon, EyeIcon, Building03Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"
import { updateElectionSettings } from "@/lib/actions/election"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const PreferencesSchema = z.object({
  allowOnlineVoting: z.boolean(),
  authorizeVoters: z.boolean(),
  showCandidateProfiles: z.boolean(),
  showCandidateSymbols: z.boolean(),
  shuffleCandidates: z.boolean(),
  allowMultipleVotes: z.boolean(),
  allowNota: z.boolean(),
  showSummary: z.boolean(),
  quickElection: z.boolean(),
  lockResult: z.boolean(),
  maxVotesPerUser: z.number().min(1, "Must be at least 1"),
})

type PreferencesFormValues = z.infer<typeof PreferencesSchema>

interface ElectionPreferencesFormProps {
  settings: any
  canManage: boolean
  tab: "preferences" | "security"
}

export function ElectionPreferencesForm({ settings, canManage, tab }: ElectionPreferencesFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      allowOnlineVoting: settings?.allowOnlineVoting ?? true,
      authorizeVoters: settings?.authorizeVoters ?? true,
      showCandidateProfiles: settings?.showCandidateProfiles ?? true,
      showCandidateSymbols: settings?.showCandidateSymbols ?? true,
      shuffleCandidates: settings?.shuffleCandidates ?? true,
      allowMultipleVotes: settings?.allowMultipleVotes ?? false,
      allowNota: settings?.allowNota ?? false,
      showSummary: settings?.showSummary ?? true,
      quickElection: settings?.quickElection ?? false,
      lockResult: settings?.lockResult ?? false,
      maxVotesPerUser: settings?.maxVotesPerUser ?? 1,
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset({
        allowOnlineVoting: settings.allowOnlineVoting,
        authorizeVoters: settings.authorizeVoters,
        showCandidateProfiles: settings.showCandidateProfiles,
        showCandidateSymbols: settings.showCandidateSymbols,
        shuffleCandidates: settings.shuffleCandidates,
        allowMultipleVotes: settings.allowMultipleVotes,
        allowNota: settings.allowNota,
        showSummary: settings.showSummary,
        quickElection: settings.quickElection,
        lockResult: settings.lockResult,
        maxVotesPerUser: settings.maxVotesPerUser,
      })
    }
  }, [settings, form])

  React.useEffect(() => {
    const subscription = form.watch(async (value, { name, type }) => {
      // Auto save on any field change
      if (type === 'change' || name) {
        const currentData = form.getValues()
        setIsPending(true)
        try {
          const res = await updateElectionSettings(settings.electionId, currentData)
          if (!res.success) {
            toast.error(res.error)
          } else {
            toast.success("Preferences updated")
          }
        } catch {
          toast.error("An unexpected error occurred while saving")
        } finally {
          setIsPending(false)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, settings.electionId])

  const onSubmit = async (data: PreferencesFormValues) => {
    // Submit is now handled by auto-save, but keeping this for form validation
  }

  // A small helper to render switch rows
  const renderSwitch = (
    name: keyof PreferencesFormValues,
    title: string,
    description: string,
    icon: any,
    disabledState: boolean = false
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground mt-0.5">
              <HugeiconsIcon icon={icon} className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Switch
            checked={field.value as boolean}
            onCheckedChange={field.onChange}
            disabled={disabledState || !canManage}
          />
        </div>
      )}
    />
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      {tab === "preferences" && (
        <>
          {/* ── Card 1: Voter Experience ───────────────────────────────────── */}
          <Card className="gap-0">
            <CardHeader className="border-b flex flex-row items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                <HugeiconsIcon icon={UserMultipleIcon} className="size-4" />
              </div>
              <div>
                <CardTitle>Voter Experience</CardTitle>
                <CardDescription>
                  Configure what voters see and how they interact with the ballot.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {renderSwitch(
                "showCandidateProfiles",
                "Show Candidate Profiles",
                "Display candidate photos on the voting page.",
                UserMultipleIcon
              )}
              {renderSwitch(
                "showCandidateSymbols",
                "Show Candidate Symbols",
                "Display candidate election symbols next to the candidate photo.",
                Settings02Icon
              )}
              {renderSwitch(
                "shuffleCandidates",
                "Shuffle Candidates",
                "Randomize the order of candidates to prevent ballot position bias.",
                Settings02Icon
              )}
              {renderSwitch(
                "allowNota",
                "Allow NOTA (None of the Above)",
                "Give voters the option to explicitly reject all candidates.",
                Settings02Icon
              )}
              {renderSwitch(
                "showSummary",
                "Show Summary Page",
                "Show voters a summary page of their selections before casting their ballot.",
                EyeIcon
              )}
            </CardContent>
          </Card>

          {/* ── Card 2: Voting Rules ──────────────────────────────────────── */}
          <Card className="gap-0">
            <CardHeader className="border-b flex flex-row items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                <HugeiconsIcon icon={Shield01Icon} className="size-4" />
              </div>
              <div>
                <CardTitle>Voting Rules</CardTitle>
                <CardDescription>
                  Control how votes are cast and counted.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {renderSwitch(
                "allowMultipleVotes",
                "Allow Multiple Votes",
                "Allow voters to vote more than once per category.",
                Shield01Icon
              )}

              <Controller
                control={form.control}
                name="maxVotesPerUser"
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground mt-0.5">
                        <HugeiconsIcon icon={Shield01Icon} className="size-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Max Votes Per User</h4>
                        <p className="text-sm text-muted-foreground">Only applies if multiple votes are allowed. Defines the maximum number of times a user can vote.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!canManage || !form.watch("allowMultipleVotes") || field.value <= 1}
                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        className="w-16 h-8 text-center"
                        disabled={!canManage || !form.watch("allowMultipleVotes")}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!canManage || !form.watch("allowMultipleVotes")}
                        onClick={() => field.onChange(field.value + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
              />

              {renderSwitch(
                "quickElection",
                "Quick Election",
                "Makes voting quicker by skipping next/previous steps and streamlining the UI.",
                Building03Icon
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "security" && (
        /* ── Card 3: Security & Access ─────────────────────────────────── */
        <Card className="gap-0">
          <CardHeader className="border-b flex flex-row items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
              <HugeiconsIcon icon={SecurityCheckIcon} className="size-4" />
            </div>
            <div>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>
                Manage voter authorization, privacy, and result visibility.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {renderSwitch(
              "allowOnlineVoting",
              "Enable Voting",
              "If disabled, no one can enter the election even if the time is correct.",
              SecurityCheckIcon
            )}
            {renderSwitch(
              "authorizeVoters",
              "Authorize Voters",
              "Require voters to be pre-registered and authorized. If disabled, anyone with the link can vote.",
              SecurityCheckIcon
            )}
            {renderSwitch(
              "lockResult",
              "Lock Results Page",
              "Lock the results page for everyone, including admins, for enhanced security and secrecy.",
              Shield01Icon
            )}
          </CardContent>
        </Card>
      )}

    </form>
  )
}
