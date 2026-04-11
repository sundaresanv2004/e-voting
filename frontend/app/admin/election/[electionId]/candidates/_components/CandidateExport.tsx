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
        "Candidate Name": candidate.name,
        "Election Role": candidate.role.name,
        "Status": "Active", // Standard status for now
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
          disabled={isExporting || data.length === 0}
        >
          {isExporting ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
          )}
          {isExporting ? "Generating..." : "Export Data"}
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
