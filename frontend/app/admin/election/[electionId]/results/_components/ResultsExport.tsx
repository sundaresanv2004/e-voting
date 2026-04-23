"use client"

import * as React from "react"
import { utils, writeFile } from "xlsx"
import {
  Download01Icon,
  File02Icon,
  TableIcon,
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
import { Spinner } from "@/components/ui/spinner"

interface ResultsExportProps {
  data: any[] // Expecting roleResults array from dashboard
  electionName: string
}

export function ResultsExport({ data, electionName }: ResultsExportProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async (type: "xlsx" | "csv") => {
    if (data.length === 0) {
      toast.error("No results data available to export")
      return
    }

    setIsExporting(true)

    try {
      // Simulate slight delay for better UX with spinner
      await new Promise(resolve => setTimeout(resolve, 800))

      const exportData: any[] = []

      data.forEach(role => {
        role.candidates.forEach((candidate: any) => {
          exportData.push({
            "Role": role.name,
            "Candidate Name": candidate.name,
            "Votes Cast": candidate.voteCount,
            "Percentage": `${candidate.percentage.toFixed(1)}%`,
            "Status": candidate.isLeading ? "Leading / Winner" : "Runner-up"
          })
        })
      })

      const worksheet = utils.json_to_sheet(exportData)
      const workbook = utils.book_new()
      utils.book_append_sheet(workbook, worksheet, "Election Results")

      const fileName = `results_${electionName.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.${type}`

      writeFile(workbook, fileName, { bookType: type === "xlsx" ? "xlsx" : "csv" })

      toast.success(`Successfully exported election results to ${type.toUpperCase()}`)
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
          <span>{isExporting ? "Generating..." : "Export"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
          <span>Excel Spreadsheet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <HugeiconsIcon icon={File02Icon} className="h-4 w-4" />
          <span>CSV File</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
