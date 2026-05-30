"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon, Shield01Icon, UserMultipleIcon, SecurityCheckIcon, EyeIcon, Building03Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"

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
  inOrgElection: z.boolean(),
  lockResult: z.boolean(),
  assignVoterToSystem: z.boolean(),
  maxVotesPerUser: z.number().min(1, "Must be at least 1"),
})

type PreferencesFormValues = z.infer<typeof PreferencesSchema>

interface ElectionPreferencesFormProps {
  settings: any
  canManage: boolean
}

export function ElectionPreferencesForm({ settings, canManage }: ElectionPreferencesFormProps) {
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
      inOrgElection: settings?.inOrgElection ?? false,
      lockResult: settings?.lockResult ?? false,
      assignVoterToSystem: settings?.assignVoterToSystem ?? false,
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
        inOrgElection: settings.inOrgElection,
        lockResult: settings.lockResult,
        assignVoterToSystem: settings.assignVoterToSystem,
        maxVotesPerUser: settings.maxVotesPerUser,
      })
    }
  }, [settings, form])

  const onSubmit = async (data: PreferencesFormValues) => {
    setIsPending(true)
    try {
      // Mock action
      toast.error("Preferences update functionality is currently a placeholder.")
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
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
            <div className="mt-0.5 rounded bg-muted/50 p-1.5 text-muted-foreground">
              <HugeiconsIcon icon={icon} className="size-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">{title}</h4>
              <p className="text-sm text-muted-foreground max-w-[400px]">{description}</p>
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
      
      {/* ── Card 1: Voter Experience ───────────────────────────────────── */}
      <Card>
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
        <CardContent className="pt-6 divide-y">
          {renderSwitch(
            "showCandidateProfiles",
            "Show Candidate Profiles",
            "Display candidate photos and biographies on the voting page.",
            UserMultipleIcon
          )}
          {renderSwitch(
            "showCandidateSymbols",
            "Show Candidate Symbols",
            "Display candidate election symbols next to their names.",
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
      <Card>
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
        <CardContent className="pt-6 divide-y">
          {renderSwitch(
            "allowMultipleVotes",
            "Allow Multiple Votes",
            "Let voters choose more than one candidate per category.",
            Shield01Icon
          )}
          
          <Controller
            control={form.control}
            name="maxVotesPerUser"
            render={({ field }) => (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded bg-muted/50 p-1.5 text-muted-foreground">
                    <HugeiconsIcon icon={Shield01Icon} className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Max Votes Per User</h4>
                    <p className="text-sm text-muted-foreground">Only applies if multiple votes are allowed.</p>
                  </div>
                </div>
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  disabled={!canManage || !form.watch("allowMultipleVotes")}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </div>
            )}
          />

          {renderSwitch(
            "inOrgElection",
            "In-Organization Election",
            "Mark this election as internal to the organization.",
            Building03Icon
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Security & Access ─────────────────────────────────── */}
      <Card>
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
        <CardContent className="pt-6 divide-y">
          {renderSwitch(
            "allowOnlineVoting",
            "Allow Online Voting",
            "Enable the public voting portal. If disabled, voting must be done via kiosk or staff entry.",
            SecurityCheckIcon
          )}
          {renderSwitch(
            "authorizeVoters",
            "Authorize Voters",
            "Require voters to be pre-registered and authorized. If disabled, voting is completely anonymous.",
            SecurityCheckIcon
          )}
          {renderSwitch(
            "lockResult",
            "Lock Results Page",
            "Lock the results page for everyone, including admins, for enhanced security and secrecy.",
            Shield01Icon
          )}
          {renderSwitch(
            "assignVoterToSystem",
            "Assign Voter to System",
            "Automatically link the voter to the system user context. (Reserved for future use)",
            UserAdd01Icon,
            true // Disabled state is true as requested
          )}
        </CardContent>
      </Card>

      {/* ── Sticky Action Bar ────────────────────────────────────────── */}
      {canManage && (
        <div className="sticky bottom-4 z-10 flex justify-end gap-4 rounded-xl border bg-background/80 p-4 shadow-md backdrop-blur">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || !form.formState.isDirty}
            onClick={() => form.reset()}
          >
            Discard Changes
          </Button>
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? "Saving Preferences…" : "Save Preferences"}
          </Button>
        </div>
      )}
    </form>
  )
}
