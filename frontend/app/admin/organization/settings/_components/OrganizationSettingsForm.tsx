"use client"

import * as React from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateOrganizationSettingsAction } from "../_actions"
import { SettingsCard } from "./SettingsCard"

interface OrganizationSettingsFormProps {
  initialData: {
    allowMachineSelfRegister: boolean
    maxMachines: number | null
    allowResultPublish: boolean
    electionRequiresApproval: boolean
    voterImportEnabled: boolean
  }
}

export function OrganizationSettingsForm({ initialData }: OrganizationSettingsFormProps) {
  // We keep the state of all settings just like initial format, but distinct components can be tricky.
  // We'll manage the state together but render multiple cards.

  return (
    <div className="space-y-8">
      <MachineRegistrationCard initialData={initialData} />
      <HardwareLimitsCard initialData={initialData} />
      <PublicResultsCard initialData={initialData} />
      <ElectionApprovalCard initialData={initialData} />
      <VoterImportCard initialData={initialData} />
    </div>
  )
}


// --- Individual Context Cards ---

function MachineRegistrationCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.allowMachineSelfRegister)
  const hasChanges = enabled !== initialData.allowMachineSelfRegister

  const handleSave = async () => {
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({ ...initialData, allowMachineSelfRegister: enabled })
      if (result.success) toast.success("Setting updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Machine Registration"
      description="Allow new polling machines to register automatically to your organization."
      footer={
        <>
          <span>Security recommendation: Keep disabled unless actively deploying machines.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
        <span className="text-sm font-medium">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
    </SettingsCard>
  )
}

function HardwareLimitsCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [max, setMax] = React.useState<string>(initialData.maxMachines ? String(initialData.maxMachines) : "")
  const currentMax = initialData.maxMachines ? String(initialData.maxMachines) : ""
  const hasChanges = max !== currentMax

  const handleSave = async () => {
    setIsPending(true)
    const val = max === "" ? null : parseInt(max)
    try {
      const result = await updateOrganizationSettingsAction({ ...initialData, maxMachines: val })
      if (result.success) toast.success("Machine limit updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Maximum Registered Machines"
      description="Limit the total number of hardware polling stations connected to your organization."
      footer={
        <>
          <span>Leave empty for unlimited machines.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10 w-full max-w-sm">
        <Input 
          type="number" 
          placeholder="Unlimited" 
          value={max} 
          onChange={(e) => setMax(e.target.value)}
          disabled={isPending} 
        />
      </div>
    </SettingsCard>
  )
}

function PublicResultsCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.allowResultPublish)
  const hasChanges = enabled !== initialData.allowResultPublish

  const handleSave = async () => {
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({ ...initialData, allowResultPublish: enabled })
      if (result.success) toast.success("Setting updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Public Results Publishing"
      description="Enable the ability to publish election results directly to the public-facing portals."
      footer={
        <>
          <span>Allows transparency but requires careful auditing before publishing.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
             {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
        <span className="text-sm font-medium">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
    </SettingsCard>
  )
}

function ElectionApprovalCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.electionRequiresApproval)
  const hasChanges = enabled !== initialData.electionRequiresApproval

  const handleSave = async () => {
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({ ...initialData, electionRequiresApproval: enabled })
      if (result.success) toast.success("Setting updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Election Approvals"
      description="Require Organization Administrators to explicitly approve any election created by Staff members."
      footer={
        <>
          <span>Recommended for large organizations to prevent unauthorized voting events.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
             {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
        <span className="text-sm font-medium">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
    </SettingsCard>
  )
}

function VoterImportCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.voterImportEnabled)
  const hasChanges = enabled !== initialData.voterImportEnabled

  const handleSave = async () => {
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({ ...initialData, voterImportEnabled: enabled })
      if (result.success) toast.success("Setting updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Bulk Voter Imports"
      description="Allow the organization to bulk import voter data via CSV or Excel files."
      footer={
        <>
          <span>Importing large datasets can significantly impact system resources.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
             {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
        <span className="text-sm font-medium">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
    </SettingsCard>
  )
}
