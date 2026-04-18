"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ElectionStatus } from "@prisma/client"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InformationCircleIcon,
  Calendar02Icon,
  ShieldKeyIcon,
  Alert01Icon,
  Delete02Icon,
  ComputerIcon,
  IdentificationIcon,
  Tick01Icon,
  UserGroupIcon,
  ShuffleIcon,
  ImageAdd01Icon,
  PauseIcon,
  PlayIcon,
  Copy01Icon,
  EyeIcon,
  GlobeIcon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { DateTimePicker } from "@/app/admin/organization/elections/_components/date-time-picker"

import { 
    updateElectionSettingsAction, 
    updateElectionCoreAction 
} from "../_actions"
import { deleteElection, toggleElectionStatus } from "@/app/admin/organization/elections/_actions"
import { useSession } from "next-auth/react"
import { DeleteElectionDialog } from "@/app/admin/organization/elections/_components/delete-election-dialog"
import { ElectionCodeDialog } from "./ElectionCodeDialog"

interface ElectionSettingsContainerProps {
  election: {
    id: string
    name: string
    code: string
    startTime: Date | string
    endTime: Date | string
    status: ElectionStatus
    settings: {
      allowOnlineVoting: boolean
      allowOfflineVoting: boolean
      authorizeVoters: boolean
      showCandidateProfiles: boolean
      showCandidateSymbols: boolean
      shuffleCandidates: boolean
    } | null
  }
}

export function ElectionSettingsContainer({ election }: ElectionSettingsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useSession()
  const isOrgAdmin = session.data?.user?.role === "ORG_ADMIN"

  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isOrgAdmin) return "general"
    return tab
  })

  React.useEffect(() => {
    const tab = searchParams.get("tab") || "general"
    if (tab === "danger" && !isOrgAdmin) {
      setActiveTab("general")
    } else {
      setActiveTab(tab)
    }
  }, [searchParams, isOrgAdmin])

  const handleTabChange = (value: string) => {
    if (value === "danger" && !isOrgAdmin) return
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="general" className="gap-1.5">
          <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-1.5">
          <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="ballot" className="gap-1.5">
          <HugeiconsIcon icon={ImageAdd01Icon} className="h-4 w-4" />
          Ballot
        </TabsTrigger>
        {isOrgAdmin && (
          <TabsTrigger
            value="danger"
            className="gap-1.5 data-[state=active]:text-red-500 dark:data-[state=active]:text-red-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="general" className="mt-6 space-y-5">
        <IdentitySection election={election} />
        <TimingSection election={election} />
        <StatusSection election={election} />
        <CodeSection code={election.code} />
      </TabsContent>

      <TabsContent value="security" className="mt-6 space-y-5">
        <VoterAuthSection election={election} />
        <OnlineVotingSection election={election} />
        <OfflineVotingSection election={election} />
      </TabsContent>

      <TabsContent value="ballot" className="mt-6 space-y-5">
        <CandidateProfileSection election={election} />
        <CandidateSymbolSection election={election} />
        <ShuffleCandidatesSection election={election} />
      </TabsContent>

      {isOrgAdmin && (
        <TabsContent value="danger" className="mt-6 space-y-5">
          <DangerSection election={election} />
        </TabsContent>
      )}
    </Tabs>
  )
}


// ─── General Tab ────────────────────────────────────────────────────────────────

function IdentitySection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [name, setName] = React.useState(election.name)

  const hasChanges = name !== election.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Election name is required")
      return
    }
    setIsPending(true)
    try {
      const result = await updateElectionCoreAction(election.id, {
        name,
        startTime: new Date(election.startTime),
        endTime: new Date(election.endTime),
      })
      if (result.success) toast.success("Election identity updated")
      else toast.error(result.error || "Failed to update")
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Election Name</h3>
              <p className="text-[12px] text-muted-foreground">The public-facing name displayed across voting systems and dashboards.</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <Input
              id="election-name"
              placeholder="e.g. Student Council Election 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3 bg-muted/40 border-t text-[13px] text-muted-foreground">
          <span>Maximum 64 characters recommended for readability.</span>
          <Button type="submit" disabled={isPending || !hasChanges} size="sm" className="relative group overflow-hidden gap-2">
            {isPending && <Spinner className="h-4 w-4" color="currentColor" />}
            <span>{isPending ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

function StatusSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [status, setStatus] = React.useState(election.status)
  const router = useRouter()

  React.useEffect(() => {
    setStatus(election.status)
  }, [election.status])

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
    COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  }

  const canToggle = status === "ACTIVE" || status === "PAUSED"

  const handleToggle = async () => {
    setIsPending(true)
    try {
      const result = await toggleElectionStatus(election.id)
      if (result.success) {
        setStatus(result.status)
        toast.success(result.status === "PAUSED" ? "Election paused" : "Election resumed")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Lifecycle Status</h3>
              <p className="text-[12px] text-muted-foreground">Automatically managed based on the configured election schedule.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1", statusColors[status])}>
              {status}
            </Badge>
            {canToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                  "gap-2 shrink-0 transition-all active:scale-[0.98]",
                  status === "ACTIVE"
                    ? "border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/5"
                    : "border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/5"
                )}
              >
                {isPending ? (
                  <Spinner className="h-3.5 w-3.5" color="currentColor" />
                ) : status === "ACTIVE" ? (
                  <HugeiconsIcon icon={PauseIcon} className="h-3.5 w-3.5" />
                ) : (
                  <HugeiconsIcon icon={PlayIcon} className="h-3.5 w-3.5" />
                )}
                {isPending ? "Updating..." : status === "ACTIVE" ? "Pause Election" : "Resume Election"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CodeSection({ code }: { code: string }) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-amber-500/20 bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Election Access Code</h3>
              <p className="text-[12px] text-muted-foreground">Used by voting terminals to identify and connect to this election.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto font-medium shadow-sm transition-all hover:bg-amber-500/5 hover:text-amber-700 hover:border-amber-500/30 gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
              Reveal Code
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/5 border-t border-amber-500/20 text-[12px] text-amber-700 dark:text-amber-400 font-medium">
        <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5 shrink-0" />
        This code is locked and cannot be modified after election creation.
      </div>
      <ElectionCodeDialog code={code} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}


// ─── Timing Tab ─────────────────────────────────────────────────────────────────

function TimingSection({ election }: { election: any }) {
  const [start, setStart] = React.useState<Date>(new Date(election.startTime))
  const [end, setEnd] = React.useState<Date>(new Date(election.endTime))
  const [isPending, setIsPending] = React.useState(false)

  const hasChanges = start.getTime() !== new Date(election.startTime).getTime() ||
    end.getTime() !== new Date(election.endTime).getTime()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const result = await updateElectionCoreAction(election.id, {
        name: election.name,
        startTime: start,
        endTime: end,
      })
      if (result.success) toast.success("Election schedule updated")
      else toast.error(result.error)
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Election Schedule</h3>
              <p className="text-[12px] text-muted-foreground">Define the exact start and end times for voting availability.</p>
            </div>
          </div>
          <div className="space-y-4 p-5 rounded-2xl border max-w-2xl bg-muted/10">
            <DateTimePicker
              id="start"
              label="Start"
              date={start}
              onChange={setStart}
            />
            <div className="h-px bg-border -mx-5 opacity-40" />
            <DateTimePicker
              id="end"
              label="End"
              date={end}
              onChange={setEnd}
              minDate={start}
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3 bg-muted/40 border-t text-[13px] text-muted-foreground">
          <span>Times are handled in your local timezone settings.</span>
          <Button type="submit" disabled={isPending || !hasChanges} size="sm" className="relative group overflow-hidden gap-2">
            {isPending && <Spinner className="h-4 w-4" color="currentColor" />}
            <span>{isPending ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}


// ─── Security Tab ───────────────────────────────────────────────────────────────

function VoterAuthSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const isOnlineEnabled = election.settings?.allowOnlineVoting ?? false
  const [enabled, setEnabled] = React.useState(election.settings?.authorizeVoters ?? false)
  const router = useRouter()

  React.useEffect(() => {
    setEnabled(election.settings?.authorizeVoters ?? false)
  }, [election.settings?.authorizeVoters])

  React.useEffect(() => {
    if (isOnlineEnabled && !enabled) {
        setEnabled(true)
    }
  }, [isOnlineEnabled, enabled])

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      const result = await updateElectionSettingsAction(election.id, { authorizeVoters: checked })
      if (result.success) {
          toast.success("Voter authorization policy updated")
          router.refresh()
      }
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update policy")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <HugeiconsIcon icon={IdentificationIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Voter Roll Authorization</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {isOnlineEnabled ? (
                    "Authorization is mandatory for online elections to protect identity and ensure 'One Person, One Vote' integrity."
                ) : (
                    "Voters must be present in the registered voter roll to cast a ballot. When disabled, anyone at an authorized terminal can vote."
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={isOnlineEnabled ? true : enabled} onCheckedChange={handleToggle} disabled={isPending || isOnlineEnabled} />
          </div>
        </div>
      </div>
    </div>
  )
}

function OnlineVotingSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(election.settings?.allowOnlineVoting ?? false)
  const router = useRouter()

  React.useEffect(() => {
    setEnabled(election.settings?.allowOnlineVoting ?? false)
  }, [election.settings?.allowOnlineVoting])

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      // If turning online ON, also toggle off offline for mutual exclusivity AND enforce voter auth
      const result = await updateElectionSettingsAction(election.id, { 
        allowOnlineVoting: checked,
        ...(checked ? { allowOfflineVoting: false, authorizeVoters: true } : {})
      })
      if (result.success) {
          toast.success("Online voting capability updated")
          router.refresh()
      }
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Web-Based Online Voting</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Allow participants to cast votes through the website. <span className="text-primary font-medium italic underline underline-offset-2">Enabling this disables Offline Voting and enforces Voter Authorization.</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </div>
      </div>
    </div>
  )
}

function OfflineVotingSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(election.settings?.allowOfflineVoting ?? false)
  const router = useRouter()

  React.useEffect(() => {
    setEnabled(election.settings?.allowOfflineVoting ?? false)
  }, [election.settings?.allowOfflineVoting])

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      // If turning offline ON, toggle off online for mutual exclusivity
      const result = await updateElectionSettingsAction(election.id, { 
        allowOfflineVoting: checked,
        ...(checked ? { allowOnlineVoting: false } : {})
      })
      if (result.success) {
          toast.success("Hardware-app voting capability updated")
          router.refresh()
      }
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Dedicated Hardware-App Voting</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Enable voting through authorized desktop kiosk applications. <span className="text-primary font-medium italic underline underline-offset-2">Enabling this disables Online Voting.</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Ballot Tab ─────────────────────────────────────────────────────────────────

function CandidateProfileSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(election.settings?.showCandidateProfiles ?? true)

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      const result = await updateElectionSettingsAction(election.id, { showCandidateProfiles: checked })
      if (result.success) toast.success("Candidate profile visibility updated")
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Show Candidate Profiles</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Display candidate profile photos on the ballot interface. Disabling this shows names only for a minimalist voting experience.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CandidateSymbolSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(election.settings?.showCandidateSymbols ?? true)

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      const result = await updateElectionSettingsAction(election.id, { showCandidateSymbols: checked })
      if (result.success) toast.success("Candidate symbol visibility updated")
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <HugeiconsIcon icon={ImageAdd01Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Show Candidate Symbols</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Display party or candidate symbols alongside names on the ballot. Useful for elections with representative imagery.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ShuffleCandidatesSection({ election }: { election: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(election.settings?.shuffleCandidates ?? true)

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      const result = await updateElectionSettingsAction(election.id, { shuffleCandidates: checked })
      if (result.success) toast.success("Candidate ordering policy updated")
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update setting")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <HugeiconsIcon icon={ShuffleIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Shuffle Candidate Order</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Randomize the display order of candidates on each ballot to prevent positional bias and ensure fair representation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-1">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isPending} />
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Danger Zone Tab ────────────────────────────────────────────────────────────

function DangerSection({ election }: { election: any }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/admin/organization/elections")
  }

  return (
    <div className="rounded-xl border border-destructive/20 bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">Delete this Election</h3>
              <p className="text-[13px] text-muted-foreground">
                Permanently remove this election, all roles, candidates, voters, and cast ballots. This action cannot be recovered.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 shrink-0 active:scale-[0.98] transition-all"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Election
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-6 py-3 bg-destructive/5 border-t border-destructive/20 text-[12px] text-destructive font-medium">
        <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5 shrink-0" />
        This action is irreversible. Use with caution.
      </div>

      <DeleteElectionDialog 
        election={election} 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
