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
import type { VoterColumn } from "./columns"
import { Spinner } from "@/components/ui/spinner"

interface VoterExportProps {
  data: VoterColumn[]
  electionName: string
}

export function VoterExport({ data, electionName }: VoterExportProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExport = async (type: "xlsx" | "csv") => {
    if (data.length === 0) {
      toast.error("No voter data available to export")
      return
    }

    setIsExporting(true)

    try {
      // Simulate slight delay for better UX with spinner
      await new Promise(resolve => setTimeout(resolve, 800))

      // 1. Identify all unique metadata keys across all voters
      const metadataKeys = new Set<string>()
      data.forEach(voter => {
        if (voter.additionalDetails && typeof voter.additionalDetails === 'object') {
          Object.keys(voter.additionalDetails).forEach(key => metadataKeys.add(key))
        }
      })

      const sortedMetadataKeys = Array.from(metadataKeys).sort()

      // 2. Map data for export
      const exportData = data.map(voter => {
        const row: any = {
          "Unique ID": voter.uniqueId,
          "Full Name": voter.name,
          "Voting Status": voter.ballot ? "Voted" : "Not Voted",
          "Voted At": voter.ballot ? new Date(voter.ballot.createdAt).toLocaleString() : "—",
        }

        // Add metadata columns
        sortedMetadataKeys.forEach(key => {
          row[key] = (voter.additionalDetails as any)?.[key] ?? ""
        })

        // Add remaining record-keeping columns
        row["Created At"] = new Date(voter.createdAt).toLocaleString()
        row["Last Updated"] = voter.updatedAt ? new Date(voter.updatedAt).toLocaleString() : "—"

        return row
      })

      const worksheet = utils.json_to_sheet(exportData)
      const workbook = utils.book_new()
      utils.book_append_sheet(workbook, worksheet, "Voters")

      const fileName = `voters_${electionName.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.${type}`

      writeFile(workbook, fileName, { bookType: type === "xlsx" ? "xlsx" : "csv" })

      toast.success(`Successfully exported ${data.length} voters to ${type.toUpperCase()}`)
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
      <DropdownMenuContent align="end" className="w-56 bg-card">
        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("xlsx")} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
          <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
          <span className="font-medium">Excel Spreadsheet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
          <HugeiconsIcon icon={File02Icon} className="h-4 w-4" />
          <span className="font-medium">CSV File</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
