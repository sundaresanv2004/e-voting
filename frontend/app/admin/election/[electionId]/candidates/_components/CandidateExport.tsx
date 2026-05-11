"use client"

import * as React from "react"
import { utils, writeFile } from "xlsx"
import {
  Download01Icon,
  File02Icon,
  TableIcon,
  Loading03Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { CandidateColumn } from "./candidate-columns"
import { Spinner } from "@/components/ui/spinner"

interface CandidateExportProps {
  data: CandidateColumn[]
  electionName: string
}

export function CandidateExport({ data, electionName }: CandidateExportProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async (type: "xlsx" | "csv") => {
    if (data.length === 0) {
      toast.error("No candidate data available to export")
      return
    }

    setIsExporting(true)

    try {
      // Simulate slight delay for better UX with spinner
      await new Promise(resolve => setTimeout(resolve, 800))

      const exportData = data.map(candidate => ({
        "Candidate ID": candidate.id,
        "Candidate Name": candidate.name,
        "Election Role": candidate.role.name,
        "Status": "Active",
        "Created At": new Date(candidate.createdAt).toLocaleString(),
        "Last Updated": new Date(candidate.updatedAt).toLocaleString()
      }))

      const worksheet = utils.json_to_sheet(exportData)
      const workbook = utils.book_new()
      utils.book_append_sheet(workbook, worksheet, "Candidates")

      const fileName = `candidates_${electionName.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.${type}`

      writeFile(workbook, fileName, { bookType: type === "xlsx" ? "xlsx" : "csv" })

      toast.success(`Successfully exported ${data.length} candidates to ${type.toUpperCase()}`)
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to generate export file")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
        >
          {isExporting ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
          )}
          <span className="font-semibold">{isExporting ? "Generating..." : "Export"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border-primary/10">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />

        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Excel Spreadsheet</span>
            <span className="text-[10px] text-muted-foreground font-medium">Full candidate data breakdown</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
            <HugeiconsIcon icon={File02Icon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">CSV File</span>
            <span className="text-[10px] text-muted-foreground font-medium">Simple text-based format</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

