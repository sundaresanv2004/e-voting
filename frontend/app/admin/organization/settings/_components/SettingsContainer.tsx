"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { OrganizationType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateOrganizationAction, updateOrganizationSettingsAction } from "../_actions"
import { ImageUpload } from "@/components/ui/image-upload"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  EyeIcon,
  Alert01Icon,
  Delete02Icon,
  Building02Icon,
  Building05Icon,
  ComputerIcon,
  ShieldKeyIcon,
  Image01Icon,
  UserAccountIcon,
  Copy01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { OrganizationCodeDialog } from "../../systems/_components/OrganizationCodeDialog"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"
import { TransferOwnershipDialog } from "./TransferOwnershipDialog"
import { Spinner } from "@/components/ui/spinner"


interface SettingsContainerProps {
  organization: {
    id: string
    name: string
    type: OrganizationType
    code: string
    ownerId: string | null
    logo: string | null
    settings: {
      allowSystemConnection: boolean
      maxSystems: number | null
    } | null
  }
}

export function SettingsContainer({ organization }: SettingsContainerProps) {
  const router = useRouter()
  const session = useSession()
  const searchParams = useSearchParams()
  const isOwner = session.data?.user?.id === organization.ownerId
  const [activeTab, setActiveTab] = React.useState(() => {
    const tab = searchParams.get("tab") || "profile"
    if (tab === "danger" && !isOwner) return "profile"
    return tab
  })

  // Ensure activeTab stays in sync if searchParams change, 
  // but strictly enforce the isOwner restriction.
  React.useEffect(() => {
    const tab = searchParams.get("tab") || "profile"
    if (tab === "danger" && !isOwner) {
      setActiveTab("profile")
    } else {
      setActiveTab(tab)
    }
  }, [searchParams, isOwner])

  const handleTabChange = (value: string) => {
    if (value === "danger" && !isOwner) return
    setActiveTab(value)
    // Update URL without a full page reload
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="profile" className="gap-1.5">
          <HugeiconsIcon icon={Building05Icon} className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="systems" className="gap-1.5">
          <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4" />
          Systems
        </TabsTrigger>
        {isOwner && (
          <TabsTrigger
            value="danger"
            className="gap-1.5 data-[state=active]:text-red-500 dark:data-[state=active]:text-red-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        )}
      </TabsList>


      <TabsContent value="profile" className="mt-6 space-y-5">
        <IdentitySection
          initialData={{ name: organization.name, type: organization.type, logo: organization.logo, code: organization.code }}
        />
        <LogoSection
          initialData={{ name: organization.name, type: organization.type, logo: organization.logo, code: organization.code }}
        />
        <CodeSection code={organization.code} />
      </TabsContent>

      <TabsContent value="systems" className="mt-6 space-y-5">
        {organization.settings && (
          <>
            <RegistrationSection initialData={organization.settings} />
            <LimitsSection initialData={organization.settings} />
          </>
        )}
      </TabsContent>

      {isOwner && (
        <TabsContent value="danger" className="mt-6 space-y-5">
          <TransferSection />
          <DeleteSection orgName={organization.name} />
        </TabsContent>
      )}
    </Tabs>
  )
}

// Clean card: title on left, inline fields, footer with save

interface ProfileData {
  name: string
  type: OrganizationType
  code: string
  logo?: string | null
}

function IdentitySection({ initialData }: { initialData: ProfileData }) {
  const [isPending, setIsPending] = React.useState(false)
  const [name, setName] = React.useState(initialData.name)
  const [type, setType] = React.useState<OrganizationType>(initialData.type)

  const hasChanges = name !== initialData.name || type !== initialData.type

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Organization name is required")
      return
    }
    setIsPending(true)
    try {
      const result = await updateOrganizationAction(name, type, initialData.logo || "")
      if (result.success) toast.success("Organization identity updated")
      else toast.error(result.error || "Something went wrong")
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
              <HugeiconsIcon icon={Building02Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Organization Name & Type</h3>
              <p className="text-[12px] text-muted-foreground">The primary identity of your organization across the platform.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              id="org-name"
              placeholder="e.g. Vels Vidyashram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="flex-1"
            />
            <Select onValueChange={(v) => setType(v as OrganizationType)} value={type} disabled={isPending}>
              <SelectTrigger id="org-type" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrganizationType.SCHOOL}>School</SelectItem>
                <SelectItem value={OrganizationType.COLLEGE}>College / University</SelectItem>
                <SelectItem value={OrganizationType.OTHER}>Other Institution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-3 bg-muted/40 border-t text-[13px] text-muted-foreground">
          <span>Please use 32 characters at maximum.</span>
          <Button type="submit" disabled={isPending || !hasChanges} size="sm" className="relative group overflow-hidden gap-2">
            {isPending && <Spinner className="h-4 w-4" color="currentColor" />}
            <span>{isPending ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}


// ─── 2. Organization Logo ───────────────────────────────────────────────────────
// Full-width upload area with landscape preview, auto-saves on upload

function LogoSection({ initialData }: { initialData: ProfileData }) {
  const [isPending, setIsPending] = React.useState(false)
  const [logo, setLogo] = React.useState(initialData.logo || "")

  const handleLogoChange = async (newUrl: string) => {
    setLogo(newUrl)
    setIsPending(true)
    try {
      const result = await updateOrganizationAction(initialData.name, initialData.type, newUrl)
      if (result.success) toast.success("Logo updated")
      else toast.error(result.error || "Failed to save logo")
    } catch {
      toast.error("Auto-save failed")
    } finally {
      setIsPending(false)
    }
  }

  const handleRemoveLogo = async () => {
    setLogo("")
    setIsPending(true)
    try {
      const result = await updateOrganizationAction(initialData.name, initialData.type, "")
      if (result.success) toast.success("Logo removed")
      else toast.error(result.error || "Failed to remove logo")
    } catch {
      toast.error("Operation failed")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Organization Logo</h3>
              <p className="text-[12px] text-muted-foreground">Your logo appears on voting screens, public portals, and official documents.</p>
            </div>
          </div>
          {logo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 h-8 gap-2"
            >
              {isPending ? <Spinner className="h-3.5 w-3.5" color="currentColor" /> : <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />}
              {isPending ? "Removing..." : "Remove"}
            </Button>
          )}
        </div>
        <div className="w-full max-w-2xl">
          <ImageUpload
            value={logo}
            onChange={handleLogoChange}
            disabled={isPending}
            folder="organizations/logos"
            className="aspect-[2258/476]"
          />
        </div>
      </div>
      <div className="px-6 py-3 bg-muted/40 border-t text-[12px] text-muted-foreground">
        Recommended: landscape ratio (~2260×480px), PNG or SVG preferred. Auto-saves on upload.
      </div>
    </div>
  )
}


// ─── 3. Organization Access Code ────────────────────────────────────────────────
// Security-themed card with amber warning styling

function CodeSection({ code }: { code: string }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Organization code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="rounded-xl border border-amber-500/20 bg-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" color="currentColor" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Organization Access Code</h3>
                <p className="text-[12px] text-muted-foreground">Used by voting systems to authenticate and sync with your organization.</p>
              </div>
            </div>
            <div className="flex flex-row gap-2 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} className={cn("h-4 w-4", copied && "text-green-500")} />
                {copied ? "Copied" : "Copy Code"}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                Reveal
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/5 border-t border-amber-500/20 text-[12px] text-amber-700 dark:text-amber-400 font-medium">
          <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5 shrink-0" />
          Keep this code confidential. Do not share it publicly.
        </div>
      </div>
      <OrganizationCodeDialog code={code} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}


// ─── 4. System Self-Registration ────────────────────────────────────────────────
// Horizontal layout: description on left, toggle + save on right

interface SystemSettingsData {
  allowSystemConnection: boolean
  maxSystems: number | null
}

function RegistrationSection({ initialData }: { initialData: SystemSettingsData }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.allowSystemConnection)

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked)
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({
        allowSystemConnection: checked,
        maxSystems: initialData.maxSystems
      })
      if (result.success) toast.success("System connection policy updated")
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Allow Local System Connection</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Enable this to allow local voting systems to connect and establish communication with your organization's cloud. This is required for both initial registration and ongoing communication.
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


// ─── 5. Maximum Registered Systems ──────────────────────────────────────────────
// Compact card: description + input side by side

function LimitsSection({ initialData }: { initialData: SystemSettingsData }) {
  const [isPending, setIsPending] = React.useState(false)
  const defaultMaxSystems = initialData.maxSystems ?? 20
  const [max, setMax] = React.useState<number>(defaultMaxSystems)

  const handleValueCommit = async (value: number[]) => {
    const newValue = value[0]
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({
        allowSystemConnection: initialData.allowSystemConnection,
        maxSystems: newValue
      })
      if (result.success) toast.success("System limit updated")
      else toast.error(result.error)
    } catch {
      toast.error("Failed to update limit")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <HugeiconsIcon icon={Building05Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Maximum Registered Systems</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Set a cap on the total number of systems that can be connected to your organization (maximum 20).
              </p>
            </div>
          </div>
          <div className="w-full sm:w-[250px] shrink-0 space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs">{max} systems</span>
              <Badge variant="outline">{max === 20 ? "Maximum" : "Limited"}</Badge>
            </div>
            <Slider
              value={[max]}
              onValueChange={(val) => setMax(val[0])}
              onValueCommit={handleValueCommit}
              max={20}
              min={1}
              step={1}
              disabled={isPending}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}



// ─── 6. Delete Organization ─────────────────────────────────────────────────────
// Red-themed danger card with prominent warning

function DeleteSection({ orgName }: { orgName: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-destructive/20 bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">Delete this Organization</h3>
              <p className="text-[13px] text-muted-foreground">
                Once deleted, all data is permanently removed and cannot be recovered.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 shrink-0 active:scale-[0.98] transition-all"
            onClick={() => setIsOpen(true)}
          >
            Delete Organization
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-6 py-3 bg-destructive/5 border-t border-destructive/20 text-[12px] text-destructive font-medium">
        <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5 shrink-0" />
        This action is irreversible. Use with caution.
      </div>

      <DeleteOrganizationDialog
        orgName={orgName}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  )
}

function TransferSection() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-blue-500/20 bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <HugeiconsIcon icon={UserAccountIcon} className="h-4 w-4" color="currentColor" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Transfer Ownership</h3>
              <p className="text-[13px] text-muted-foreground">
                Transfer management control of this organization to another member.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0 border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 active:scale-[0.98] transition-all"
            onClick={() => setIsOpen(true)}
          >
            Transfer Ownership
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-6 py-3 bg-blue-500/5 border-t border-blue-500/20 text-[12px] text-blue-700 dark:text-blue-400 font-medium">
        <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5 shrink-0" />
        Once transferred, you will no longer have owner-level access to these settings.
      </div>

      <TransferOwnershipDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  )
}
