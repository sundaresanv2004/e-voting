"use client"

import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  CheckmarkCircle02Icon, 
  CancelCircleIcon, 
  InformationCircleIcon 
} from "@hugeicons/core-free-icons"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { updateElectionSettings } from "../_actions"

interface SettingsToggleProps {
  electionId: string
  title: string
  description: string
  value: boolean
  icon: any
}

export function SettingsToggle({
  electionId,
  title,
  description,
  value,
  icon,
}: SettingsToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [currentValue, setCurrentValue] = React.useState(value)

  const handleToggle = (checked: boolean) => {
    setCurrentValue(checked)
    startTransition(async () => {
      try {
        const result = await updateElectionSettings(electionId, {
          applyRolesToSystems: checked,
        })
        if (result.success) {
          toast.success("Settings updated successfully")
        } else {
          toast.error(result.error || "Failed to update settings")
          setCurrentValue(!checked) // rollback
        }
      } catch (err) {
        toast.error("An unexpected error occurred")
        setCurrentValue(!checked) // rollback
      }
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300",
            currentValue ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground opacity-60"
          )}>
            <HugeiconsIcon icon={icon} className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <Label className="text-base font-bold tracking-tight">
              {title}
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPending && (
             <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
          <Switch
            checked={currentValue}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 border-t pt-4 border-dashed opacity-60">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
           {currentValue ? (
             <>
               <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3 text-green-500" />
               <span className="text-green-600">Enabled</span>
             </>
           ) : (
             <>
               <HugeiconsIcon icon={CancelCircleIcon} className="h-3 w-3 text-destructive" />
               <span className="text-destructive">Disabled</span>
             </>
           )}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
          <HugeiconsIcon icon={InformationCircleIcon} className="h-3 w-3" />
          Default: Enabled
        </div>
      </div>
    </div>
  )
}
