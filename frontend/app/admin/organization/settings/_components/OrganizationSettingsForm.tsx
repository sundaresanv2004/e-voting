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
    allowSystemRegistration: boolean
    maxSystems: number | null
  }
}

export function OrganizationSettingsForm({ initialData }: OrganizationSettingsFormProps) {
  return (
    <div className="space-y-8">
      <SystemRegistrationCard initialData={initialData} />
      <SystemLimitsCard initialData={initialData} />
    </div>
  )
}


// --- Individual Context Cards ---

function SystemRegistrationCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [enabled, setEnabled] = React.useState(initialData.allowSystemRegistration)
  const hasChanges = enabled !== initialData.allowSystemRegistration

  const handleSave = async () => {
    setIsPending(true)
    try {
      const result = await updateOrganizationSettingsAction({ 
        allowSystemRegistration: enabled,
        maxSystems: initialData.maxSystems 
      })
      if (result.success) toast.success("Self-registration policy updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="System Self-Registration"
      description="Allow new polling hardware stations to register automatically to your organization using your unique code."
      footer={
        <>
          <span className="text-muted-foreground italic">Security: Keep disabled unless actively deploying new voting systems.</span>
          <Button onClick={handleSave} disabled={isPending || !hasChanges} size="sm">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex items-center space-x-3 h-10">
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={isPending} />
        <span className="text-sm font-medium">{enabled ? "Allowed" : "Restricted"}</span>
      </div>
    </SettingsCard>
  )
}

function SystemLimitsCard({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = React.useState(false)
  const [max, setMax] = React.useState<string>(initialData.maxSystems ? String(initialData.maxSystems) : "")
  const currentMax = initialData.maxSystems ? String(initialData.maxSystems) : ""
  const hasChanges = max !== currentMax

  const handleSave = async () => {
    setIsPending(true)
    const val = max === "" ? null : parseInt(max)
    try {
      const result = await updateOrganizationSettingsAction({ 
        allowSystemRegistration: initialData.allowSystemRegistration,
        maxSystems: val 
      })
      if (result.success) toast.success("Hardware capacity updated")
      else toast.error(result.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <SettingsCard
      title="Maximum Registered Systems"
      description="Limit the total number of authorized voting machines connected to your organization."
      footer={
        <>
          <span className="text-muted-foreground italic">Leave empty for unlimited system connections.</span>
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
