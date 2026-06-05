"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { ResultsPoller } from "./results-poller"
import { ResultsExport, type ResultsExportData } from "./results-export"

interface ResultsActionsProps {
  exportData: ResultsExportData
}

export function ResultsActions({ exportData }: ResultsActionsProps) {
  const [liveRefresh, setLiveRefresh] = React.useState(false)

  return (
    <div className="flex items-center gap-3">
      {/* Invisible poller — only active when toggle is ON */}
      <ResultsPoller enabled={liveRefresh} />

      {/* Auto-refresh toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="live-refresh-header"
          checked={liveRefresh}
          onCheckedChange={setLiveRefresh}
        />
        <Label
          htmlFor="live-refresh-header"
          className={cn(
            "text-sm font-medium cursor-pointer select-none flex items-center gap-1.5 transition-colors",
            liveRefresh ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {liveRefresh && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
          Auto-refresh
        </Label>
      </div>

      <ResultsExport data={exportData} />
    </div>
  )
}
