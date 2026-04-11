"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  Tick01Icon,
  Cancel01Icon,
  IdentificationIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons"

import { 
    updateElectionSettingsAction, 
    updateElectionCoreAction 
} from "../_actions"
import { deleteElection } from "@/app/admin/organization/elections/_actions"

interface ElectionSettingsContainerProps {
  election: {
    id: string
    name: string
    code: string
    startTime: Date | string
    endTime: Date | string
    status: ElectionStatus
    settings: {
      requireSystemAuth: boolean
      allSystemsAllowed: boolean
      authorizeVoters: boolean
      verifyDob: boolean
    } | null
  }
}

export function ElectionSettingsContainer({ election }: ElectionSettingsContainerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("general")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-background/50 border shadow-sm p-1.5 h-12 mb-8">
        <TabsTrigger value="general" className="gap-2 px-6">
          <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
          General
        </TabsTrigger>
        <TabsTrigger value="timing" className="gap-2 px-6">
          <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4" />
          Timing
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2 px-6">
          <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="danger" className="gap-2 px-6 data-[state=active]:text-red-500">
          <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
          Danger Zone
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <IdentitySection election={election} />
        <StatusSection election={election} />
      </TabsContent>

      <TabsContent value="timing" className="space-y-6">
        <TimingSection election={election} />
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <AccessSection election={election} />
        <VerificationSection election={election} />
      </TabsContent>

      <TabsContent value="danger" className="space-y-6">
        <DangerSection election={election} />
      </TabsContent>
    </Tabs>
  )
}

function IdentitySection({ election }: { election: any }) {
  const [name, setName] = React.useState(election.name)
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      toast.error("An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <CardContainer
      title="Election Identity"
      description="The primary name and public identifier for this election."
      icon={InformationCircleIcon}
      iconColor="text-blue-600"
      iconBg="bg-blue-500/10"
      footer="Maximum 64 characters recommended for readability."
      onSave={handleSubmit}
      isPending={isPending}
      disabled={name === election.name}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Election Name</p>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="max-w-md bg-muted/20 border-none h-11 focus-visible:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5 opacity-60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unique Access Code</p>
          <div className="flex items-center gap-2">
            <code className="bg-muted px-4 py-2 rounded-xl border font-mono text-sm tracking-widest">
                {election.code}
            </code>
            <Badge variant="outline" className="text-[10px] py-1 font-bold">LOCKED</Badge>
          </div>
        </div>
      </div>
    </CardContainer>
  )
}

function StatusSection({ election }: { election: any }) {
  const statusColors: Record<string, string> = {
    UPCOMING: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    ACTIVE: "text-green-500 bg-green-500/10 border-green-500/20",
    COMPLETED: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    PAUSED: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    CANCELLED: "text-red-500 bg-red-500/10 border-red-500/20",
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-muted/50 border flex items-center justify-center">
                    <div className={cn("h-3 w-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor]", statusColors[election.status]?.split(" ")[0])} />
                </div>
                <div>
                    <h3 className="text-sm font-bold">Current Lifecycle Status</h3>
                    <p className="text-xs text-muted-foreground">Status is automatically managed based on election timing.</p>
                </div>
            </div>
            <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest", statusColors[election.status])}>
                {election.status}
            </Badge>
        </div>
    </div>
  )
}

function TimingSection({ election }: { election: any }) {
  const [start, setStart] = React.useState(format(new Date(election.startTime), "yyyy-MM-dd'T'HH:mm"))
  const [end, setEnd] = React.useState(format(new Date(election.endTime), "yyyy-MM-dd'T'HH:mm"))
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const result = await updateElectionCoreAction(election.id, {
        name: election.name,
        startTime: new Date(start),
        endTime: new Date(end),
      })
      if (result.success) toast.success("Election schedule updated")
      else toast.error(result.error)
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const hasChanges = start !== format(new Date(election.startTime), "yyyy-MM-dd'T'HH:mm") ||
                    end !== format(new Date(election.endTime), "yyyy-MM-dd'T'HH:mm")

  return (
    <CardContainer
      title="Election Schedule"
      description="Define the exact start and end times for voting availability."
      icon={Calendar02Icon}
      iconColor="text-indigo-600"
      iconBg="bg-indigo-500/10"
      footer="Times are handled in your local timezone settings."
      onSave={handleSubmit}
      isPending={isPending}
      disabled={!hasChanges}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Start Time</p>
          <Input 
            type="datetime-local" 
            value={start} 
            onChange={(e) => setStart(e.target.value)}
            className="bg-muted/20 border-none h-11 focus-visible:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">End Time</p>
          <Input 
            type="datetime-local" 
            value={end} 
            onChange={(e) => setEnd(e.target.value)}
            className="bg-muted/20 border-none h-11 focus-visible:ring-primary/20"
          />
        </div>
      </div>
    </CardContainer>
  )
}

function AccessSection({ election }: { election: any }) {
    const [isPending, setIsPending] = React.useState(false)
    const settings = election.settings

    const handleToggle = async (field: string, value: boolean) => {
        setIsPending(true)
        try {
            const result = await updateElectionSettingsAction(election.id, { [field]: value })
            if (result.success) toast.success("Access policy updated")
            else toast.error(result.error)
        } catch {
            toast.error("Connection error")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-4">
            <ToggleCard 
                title="Require Hardware Encryption"
                description="Only allow voting from authorized terminal systems with verified hardware IDs."
                icon={ComputerIcon}
                iconColor="text-purple-600"
                iconBg="bg-purple-500/10"
                checked={settings?.requireSystemAuth ?? true}
                onCheckedChange={(v: boolean) => handleToggle("requireSystemAuth", v)}
                disabled={isPending}
            />
            <ToggleCard 
                title="Strict System Filtering"
                description="Restrict this election to specific designated voting systems only."
                icon={Tick01Icon}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-500/10"
                checked={!settings?.allSystemsAllowed}
                onCheckedChange={(v: boolean) => handleToggle("allSystemsAllowed", !v)}
                disabled={isPending}
            />
        </div>
    )
}

function VerificationSection({ election }: { election: any }) {
    const [isPending, setIsPending] = React.useState(false)
    const settings = election.settings

    const handleToggle = async (field: string, value: boolean) => {
        setIsPending(true)
        try {
            const result = await updateElectionSettingsAction(election.id, { [field]: value })
            if (result.success) toast.success("Verification policy updated")
            else toast.error(result.error)
        } catch {
            toast.error("System error")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-4">
            <ToggleCard 
                title="Voter Roll Authorization"
                description="Voters must be present in the registered voter roll to cast a ballot."
                icon={IdentificationIcon}
                iconColor="text-blue-600"
                iconBg="bg-blue-500/10"
                checked={settings?.authorizeVoters ?? false}
                onCheckedChange={(v: boolean) => handleToggle("authorizeVoters", v)}
                disabled={isPending}
            />
            <ToggleCard 
                title="Birthday Verification"
                description="Require voters to provide their Date of Birth for identity verification."
                icon={Calendar02Icon}
                iconColor="text-amber-600"
                iconBg="bg-amber-500/10"
                checked={settings?.verifyDob ?? false}
                onCheckedChange={(v: boolean) => handleToggle("verifyDob", v)}
                disabled={isPending}
            />
        </div>
    )
}

function DangerSection({ election }: { election: any }) {
    const [isPending, setIsPending] = React.useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you absolutely sure? This cannot be undone.")) return
        setIsPending(true)
        try {
            const result = await deleteElection(election.id)
            if (result.success) {
                toast.success("Election deleted")
                router.push("/admin/organization/elections")
            } else {
                toast.error(result.error)
            }
        } catch {
            toast.error("Deletion failed")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="rounded-2xl border border-red-500/20 bg-card overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                        <HugeiconsIcon icon={Delete02Icon} className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Archive & Delete Election</h3>
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                            Permanently remove this election, all associated roles, candidates, and cast ballots. 
                            <strong> This action is IRREVERSIBLE.</strong>
                        </p>
                    </div>
                </div>
                <div className="pt-2">
                    <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="px-8 shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all"
                    >
                        {isPending ? "Deleting..." : "Permanently Delete Election"}
                    </Button>
                </div>
            </div>
            <div className="px-8 py-3 bg-red-500/5 border-t border-red-500/20 text-[11px] text-red-600/70 font-bold uppercase tracking-widest flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-3 w-3" />
                Exercise extreme caution — Data loss will be permanent
            </div>
        </div>
    )
}

// Helper Components
function CardContainer({ 
    title, 
    description, 
    icon: Icon, 
    iconColor, 
    iconBg, 
    footer, 
    onSave, 
    children, 
    isPending,
    disabled
}: any) {
  return (
    <form onSubmit={onSave} className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", iconBg, iconColor)}>
            <HugeiconsIcon icon={Icon} className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{description}</p>
          </div>
        </div>
        <div>
          {children}
        </div>
      </div>
      <div className="px-8 py-4 bg-muted/30 border-t flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground font-medium leading-tight max-w-[70%]">
          {footer}
        </p>
        <Button size="sm" type="submit" disabled={isPending || disabled} className="px-8 rounded-xl font-bold active:scale-[0.98] transition-all">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

function ToggleCard({ title, description, icon: Icon, iconColor, iconBg, checked, onCheckedChange, disabled }: any) {
    return (
        <div className="rounded-2xl border bg-card p-6 flex items-center justify-between transition-all hover:bg-muted/5">
            <div className="flex items-center gap-4">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground max-w-lg leading-snug">{description}</p>
                </div>
            </div>
            <Switch 
                checked={checked} 
                onCheckedChange={onCheckedChange} 
                disabled={disabled}
                className="ml-6 shrink-0"
            />
        </div>
    )
}
