"use client"

import * as React from "react"
import { toast } from "sonner"
import { OrganizationType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteOrganizationAction, updateOrganizationAction } from "../_actions"
import { SettingsCard } from "./SettingsCard"
import { ImageUpload } from "@/components/ui/image-upload"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, CheckmarkCircle02Icon, EyeIcon, Alert01Icon, Delete01Icon } from "@hugeicons/core-free-icons"
import { OrganizationCodeDialog } from "../../systems/_components/OrganizationCodeDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface OrganizationProfileFormProps {
  initialData: {
    name: string
    type: OrganizationType
    code: string
    logo?: string | null
  }
}

export function OrganizationProfileForm({ initialData }: OrganizationProfileFormProps) {
  // We split the UI into two separate forms logically
  return (
    <div className="space-y-8">
      <IdentityForm initialData={initialData} />
      <LogoForm initialData={initialData} />
      <CodeForm code={initialData.code} />
      <DangerZoneForm orgName={initialData.name} />
    </div>
  )
}

function IdentityForm({ initialData }: OrganizationProfileFormProps) {
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
      // Using existing logo to not overwrite it
      const result = await updateOrganizationAction(name, type, initialData.logo || "")
      if (result.success) {
        toast.success("Organization identity updated")
      } else {
        toast.error(result.error || "Something went wrong")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsCard
        title="Organization Name & Type"
        description="This is your organization's primary identity on the platform."
        footer={
          <>
            <span>Please use 32 characters at maximum.</span>
            <Button type="submit" disabled={isPending || !hasChanges} size="sm">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
             <label htmlFor="org-name" className="text-sm font-medium">Organization Name</label>
             <Input
                id="org-name"
                placeholder="e.g. Vels Vidyashram"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="max-w-md"
              />
          </div>
          
          <div className="space-y-2">
             <label htmlFor="org-type" className="text-sm font-medium">Organization Type</label>
             <Select onValueChange={(v) => setType(v as OrganizationType)} value={type} disabled={isPending}>
                <SelectTrigger id="org-type" className="max-w-md">
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
      </SettingsCard>
    </form>
  )
}

function LogoForm({ initialData }: OrganizationProfileFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [logo, setLogo] = React.useState(initialData.logo || "")

  const hasChanges = logo !== (initialData.logo || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const result = await updateOrganizationAction(initialData.name, initialData.type, logo)
      if (result.success) {
        toast.success("Organization logo updated")
      } else {
        toast.error(result.error || "Something went wrong")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <SettingsCard
        title="Organization Logo"
        description="Upload a high-quality logo. This will be visible on all public portals."
        footer={
          <>
            <span>An image of 512x512px or larger is recommended.</span>
            <Button type="submit" disabled={isPending || !hasChanges} size="sm">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="w-full max-w-sm">
           <ImageUpload
              value={logo}
              onChange={setLogo}
              disabled={isPending}
              folder="organizations/logos"
           />
        </div>
      </SettingsCard>
    </form>
  )
}
function CodeForm({ code }: { code: string }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  return (
    <>
      <SettingsCard
        title="Organization Access Code"
        description="This unique code allows offline systems to securely access and synchronize with your organization data. Keep it secure."
        footer={
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-medium italic text-xs">
            <span>Warning: Do not share this code publicly. Systems will use this to authenticate.</span>
          </div>
        }
      >
        <div className="max-w-md">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="h-12 px-6 rounded-xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-700 font-semibold gap-2 transition-all active:scale-95"
          >
            <HugeiconsIcon icon={EyeIcon} className="h-5 w-5" />
            <span>Reveal Organization Code</span>
          </Button>
        </div>
      </SettingsCard>

      <OrganizationCodeDialog 
        code={code}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}

function DangerZoneForm({ orgName }: { orgName: string }) {
  const [isPending, setIsPending] = React.useState(false)
  const [confirmName, setConfirmName] = React.useState("")
  const router = useRouter()
  const { update } = useSession()

  const isConfirmed = confirmName === orgName

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteOrganizationAction()
      if (result.success) {
        // Force the session to update its JWT data from the database
        await update()
        toast.success("Organization deleted successfully")
        router.push("/")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete organization")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }


  return (
    <SettingsCard
      title="Danger Zone"
      description="Permanently delete this organization and all associated data. This action is irreversible."
      className="border-red-500/20 bg-red-500/[0.02]"
      footer={
        <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-medium text-xs">
          <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" />
          <span>Warning: You will lose all elections, members, and authorized systems.</span>
        </div>
      }
    >
      <div className="max-w-md">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="h-11 px-6 rounded-xl gap-2 font-semibold shadow-sm hover:shadow-red-500/20 transition-all"
              disabled={isPending}
            >
              <HugeiconsIcon icon={Delete01Icon} className="h-5 w-5" />
              <span>{isPending ? "Deleting..." : "Delete Organization"}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border-red-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <HugeiconsIcon icon={Alert01Icon} className="h-6 w-6" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pb-4 space-y-3">
                <p>
                  This action **cannot** be undone. This will permanently delete the organization 
                  and remove all associated data including:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 font-medium bg-muted/50 p-4 rounded-2xl border">
                  <li>All Election cycles and Voting results</li>
                  <li>All Authorized Hardware Systems</li>
                  <li>Organization Membership and Access logs</li>
                  <li>Organization Settings and Branding</li>
                </ul>
                <p className="text-xs pt-2">
                  All members will be reset to simple users without any organization affiliation.
                </p>

                <div className="pt-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">
                    Please type <span className="underline decoration-red-500/50 font-bold select-all">{orgName}</span> to confirm.
                  </p>
                  <Input 
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder="Enter organization name"
                    className="h-12 rounded-xl border-red-500/20 focus-visible:ring-red-500"
                    autoFocus
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel 
                onClick={() => setConfirmName("")}
                className="rounded-xl border-none bg-muted hover:bg-muted/80 transition-colors"
              >
                Cancel, Keep Organization
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={!isConfirmed || isPending}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-500/20 px-8 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none"
              >
                {isPending ? "Confirming..." : "Yes, Delete Everything"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsCard>
  )
}

