"use client"

import * as React from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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
import { format } from "date-fns"

interface ResultsExportProps {
  data: any[] // Expecting roleResults array from dashboard
  electionName: string
  organization: {
    name: string
    logo: string | null
  }
}

export function ResultsExport({ data, electionName, organization }: ResultsExportProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportXlsx = async (type: "xlsx" | "csv") => {
    if (data.length === 0) {
      toast.error("No results data available to export")
      return
    }

    setIsExporting(true)
    try {
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

  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast.error("No results data available to export")
      return
    }

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let currentY = 20

      // Add Logo if exists
      if (organization.logo) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = organization.logo
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })
          const imgWidth = 60
          const imgHeight = (img.naturalHeight / img.naturalWidth) * imgWidth
          doc.addImage(img, "PNG", (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight)
          currentY += imgHeight + 10
        } catch (e) {
          console.warn("Failed to load logo for PDF", e)
        }
      }

      // Title
      doc.setFontSize(22)
      doc.setTextColor(40)
      doc.text(organization.name, pageWidth / 2, currentY, { align: "center" })
      currentY += 10
      doc.setFontSize(16)
      doc.text(electionName, pageWidth / 2, currentY, { align: "center" })
      currentY += 15

      // Role wise results
      data.forEach((role, index) => {
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text(`Role: ${role.name}`, 14, currentY)
        currentY += 5

        const tableData = role.candidates.map((c: any) => [
          c.name,
          c.voteCount.toString(),
          `${c.percentage.toFixed(1)}%`,
          c.isLeading ? "Winner" : ""
        ])

        autoTable(doc, {
          startY: currentY,
          head: [["Candidate", "Votes", "Percentage", "Result"]],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            currentY = data.cursor?.y || currentY
          }
        })
        currentY += 15
      })

      // Winners Summary
      if (currentY > 230) {
        doc.addPage()
        currentY = 20
      }
      doc.setFontSize(16)
      doc.text("Final Winners Summary", 14, currentY)
      currentY += 5
      
      const winners = data.map(role => {
        const roleWinners = role.candidates.filter((c: any) => c.isLeading)
        return [
          role.name,
          roleWinners.map((w: any) => w.name).join(", ")
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [["Role", "Winner(s)"]],
        body: winners,
        theme: "plain",
        headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { fontSize: 11 }
      })

      // Footer with IP and Time
      const footerY = doc.internal.pageSize.getHeight() - 10
      doc.setFontSize(8)
      doc.setTextColor(150)
      
      let ip = "0.0.0.0"
      try {
        const ipRes = await fetch("/api/utils/get-ip")
        if (ipRes.ok) {
          const ipData = await ipRes.json()
          ip = ipData.ip || "0.0.0.0"
        }
      } catch (e) {}

      const timestamp = format(new Date(), "PPpp")
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "e-voting-platform.com"
      doc.text(`Downloaded on: ${timestamp} | IP: ${ip} | Source: ${appUrl}`, 14, footerY)

      const fileName = `results_${electionName.toLowerCase().replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`
      doc.save(fileName)
      toast.success("Successfully exported election results to PDF")
    } catch (error) {
      console.error("PDF Export failed:", error)
      toast.error("Failed to generate PDF document")
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
          <span className="font-semibold">{isExporting ? "Generating..." : "Export Results"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border-primary/10">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Choose Format
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />

        <DropdownMenuItem
          onClick={handleExportPDF}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
            <HugeiconsIcon icon={File02Icon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Official PDF Report</span>
            <span className="text-[10px] text-muted-foreground font-medium">Includes logo & security footer</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExportXlsx("xlsx")}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Excel Spreadsheet</span>
            <span className="text-[10px] text-muted-foreground font-medium">Full raw data breakdown</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExportXlsx("csv")}
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
