"use client"

import * as React from "react"
import { utils, writeFile } from "xlsx"
import {
  Download01Icon,
  File02Icon,
  TableIcon,
  PrinterIcon,
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
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResultsExportData {
  electionId: string
  electionName: string
  organizationName: string
  orgLogo: string | null
  allowCustomBranding: boolean
  roleResults: {
    id: string
    name: string
    order: number
    totalVotes: number
    candidates: {
      id: string
      name: string
      profileImage: string | null
      symbolImage: string | null
      voteCount: number
      percentage: number
      isLeading: boolean
    }[]
  }[]
  stats: {
    totalVoters: number
    ballotsCast: number
    turnoutPercentage: number
    totalRoles: number
    totalCandidates: number
    anonymousBallots: number
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ResultsExportProps {
  data: ResultsExportData
}

export function ResultsExport({ data }: ResultsExportProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  // ── Spreadsheet (XLSX / CSV) ───────────────────────────────────────────────
  const handleSpreadsheetExport = async (type: "xlsx" | "csv") => {
    if (data.roleResults.length === 0) {
      toast.error("No results data available to export")
      return
    }
    setIsExporting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))

      const detailRows: Record<string, string | number>[] = []
      data.roleResults.forEach((role) => {
        role.candidates.forEach((c) => {
          detailRows.push({
            "Position":              role.name,
            "Candidate":             c.name,
            "Votes":                 c.voteCount,
            "Vote Share (%)":        parseFloat(c.percentage.toFixed(1)),
            "Status":                c.isLeading ? "Leading / Winner" : "Runner-up",
          })
        })
      })

      const summaryMeta = [{
        "Election Name": data.electionName,
        "Organization":  data.organizationName,
        "Total Voters":  data.stats.totalVoters,
        "Ballots Cast":  data.stats.ballotsCast,
        "Turnout (%)":   parseFloat(data.stats.turnoutPercentage.toFixed(1)),
        "Generated At":  new Date().toLocaleString(),
      }]
      const summaryRows = data.roleResults.map((role) => ({
        "Position":       role.name,
        "Winner(s)":      role.candidates.filter((c) => c.isLeading).map((c) => c.name).join(", ") || "No votes cast",
        "Winning Votes":  role.candidates.find((c) => c.isLeading)?.voteCount ?? "—",
        "Total Votes":    role.totalVotes,
      }))

      const wb = utils.book_new()
      utils.book_append_sheet(wb, utils.json_to_sheet(detailRows), "Results Detail")
      utils.book_append_sheet(wb, utils.json_to_sheet([...summaryMeta, {}, ...summaryRows]), "Summary")

      const fileName = `results_${data.electionName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.${type}`
      writeFile(wb, fileName, { bookType: type === "xlsx" ? "xlsx" : "csv" })
      toast.success(`Exported ${detailRows.length} rows to ${type.toUpperCase()}`)
    } catch (err) {
      console.error("Export failed:", err)
      toast.error("Failed to generate export file")
    } finally {
      setIsExporting(false)
    }
  }

  // ── Print Report ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (data.roleResults.length === 0) {
      toast.error("No results data available to print")
      return
    }
    window.open(`/organisation/election/${data.electionId}/results/print`, '_blank')
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
          )}
          <span className="font-semibold">
            {isExporting ? "Generating…" : "Export"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl p-2 shadow-xl border-primary/10 bg-background"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />

        {/* Print Report */}
        <DropdownMenuItem
          onClick={handlePrint}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
            <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Print Report</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Save as PDF or send to printer
            </span>
          </div>
        </DropdownMenuItem>

        {/* Excel */}
        <DropdownMenuItem
          onClick={() => handleSpreadsheetExport("xlsx")}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Excel Spreadsheet</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Detail + summary sheets
            </span>
          </div>
        </DropdownMenuItem>

        {/* CSV */}
        <DropdownMenuItem
          onClick={() => handleSpreadsheetExport("csv")}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
            <HugeiconsIcon icon={File02Icon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">CSV File</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Simple text-based format
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
