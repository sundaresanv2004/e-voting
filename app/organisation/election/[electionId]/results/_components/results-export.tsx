"use client"

import * as React from "react"
import { utils, writeFile } from "xlsx"
import {
  Download01Icon,
  File02Icon,
  TableIcon,
  PdfIcon,
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
  }
}

// ─── Helper: fetch a remote URL and return a base64 data-URL ─────────────────

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" })
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror  = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
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

      // Sheet 1 — flat candidate rows
      const detailRows: Record<string, string | number>[] = []
      data.roleResults.forEach((role) => {
        role.candidates.forEach((c) => {
          detailRows.push({
            "Position":              role.name,
            "Position Order":        role.order,
            "Candidate":             c.name,
            "Profile Photo":         c.profileImage ? "Provided" : "No image",
            "Symbol / Party":        c.symbolImage  ? "Provided" : "No symbol",
            "Votes":                 c.voteCount,
            "Vote Share (%)":        parseFloat(c.percentage.toFixed(1)),
            "Status":                c.isLeading ? "Leading / Winner" : "Runner-up",
            "Total Votes in Position": role.totalVotes,
          })
        })
      })

      // Sheet 2 — summary
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

  // ── PDF ───────────────────────────────────────────────────────────────────
  const handlePdfExport = async () => {
    if (data.roleResults.length === 0) {
      toast.error("No results data available to export")
      return
    }
    setIsExporting(true)
    try {
      // Lazy-load heavy libraries so they don't bloat the initial bundle
      const { default: jsPDF }    = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      // ── 1. Pre-load ALL images as base64 BEFORE drawing anything ──────────
      // One cache pass so each URL is fetched once regardless of how many
      // candidates share the same asset URL.
      const imgCache = new Map<string, string | null>()
      const cacheImg = async (url: string | null) => {
        if (!url || imgCache.has(url)) return
        imgCache.set(url, await loadImageAsBase64(url))
      }

      if (data.allowCustomBranding && data.orgLogo) {
        await cacheImg(data.orgLogo)
      }
      for (const role of data.roleResults) {
        for (const c of role.candidates) {
          await cacheImg(c.profileImage)
          await cacheImg(c.symbolImage)
        }
      }

      // ── 2. Helper: draw one image from cache into the PDF ─────────────────
      const drawImg = (
        d: InstanceType<typeof jsPDF>,
        url: string | null,
        x: number,
        y: number,
        size: number
      ) => {
        if (!url) return
        const b64 = imgCache.get(url)
        if (!b64) return
        try {
          // Derive image format from the data-URL prefix
          const fmt = b64.split(";")[0].split("/")[1]?.toUpperCase() ?? "JPEG"
          d.addImage(b64, fmt as any, x, y, size, size)
        } catch { /* skip gracefully */ }
      }

      // ── 3. Document layout constants ───────────────────────────────────────
      const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const mx    = 14
      const uw    = pageW - mx * 2   // usable width ≈ 182 mm
      let   y     = 16

      const IMG_SIZE = 16  // mm — candidate/symbol images inside cells
      const ROW_H    = 22  // mm — minimum row height

      // ── 4. Header: logo → org name → election name → subtitle ─────────────
      if (data.allowCustomBranding && data.orgLogo) {
        const b64 = imgCache.get(data.orgLogo)
        if (b64) {
          try {
            const fmt = b64.split(";")[0].split("/")[1]?.toUpperCase() ?? "JPEG"
            doc.addImage(b64, fmt as any, (pageW - 32) / 2, y, 32, 16)
            y += 20
          } catch {}
        }
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.setTextColor(15, 15, 15)
      doc.text(data.organizationName, pageW / 2, y, { align: "center" })
      y += 8

      doc.setFontSize(13)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(50, 50, 50)
      doc.text(data.electionName, pageW / 2, y, { align: "center" })
      y += 6

      doc.setFontSize(8.5)
      doc.setTextColor(130, 130, 130)
      doc.text(
        `Official Election Results  ·  Generated ${new Date().toLocaleString()}`,
        pageW / 2, y, { align: "center" }
      )
      y += 8

      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.5)
      doc.line(mx, y, pageW - mx, y)
      y += 10

      // ── 5. SECTION A: Results by Position (comes FIRST) ───────────────────
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(15, 15, 15)
      doc.text("ELECTION RESULTS BY POSITION", mx, y)
      y += 8

      data.roleResults.forEach((role, rIdx) => {
        // Page-break guard
        if (y > pageH - 55) { doc.addPage(); y = 16 }

        // Dark heading bar
        doc.setFillColor(30, 30, 30)
        doc.roundedRect(mx, y - 5, uw, 11, 2, 2, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(255, 255, 255)
        doc.text(
          `${String(rIdx + 1).padStart(2, "0")}  ${role.name.toUpperCase()}`,
          mx + 4, y + 2
        )
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7.5)
        doc.setTextColor(210, 210, 210)
        doc.text(
          `${role.candidates.length} candidate${role.candidates.length !== 1 ? "s" : ""}  ·  ${role.totalVotes.toLocaleString()} total votes`,
          pageW - mx - 4, y + 2, { align: "right" }
        )
        y += 13

        // Columns: # | Photo | Name | Symbol | Votes | Status
        // widths:  9 +  22  +  63  +  22    +  24   +  27  = 167 mm  (fits ≤ 182 mm)
        const candidates = role.candidates  // already sorted desc by votes

        const rows = candidates.map((c, i) => [
          String(i + 1),
          c.profileImage ? "" : "No\nPhoto",    // drawn via hook if image exists
          c.name,
          c.symbolImage  ? "" : "No\nSymbol",
          c.voteCount.toLocaleString(),
          c.isLeading ? "WINNER" : "",
        ])

        autoTable(doc, {
          startY: y,
          head: [["#", "Photo", "Candidate Name", "Symbol", "Votes", "Status"]],
          body: rows,
          theme: "striped",
          styles: {
            minCellHeight: ROW_H,
            valign: "middle",
            fontSize: 9,
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [55, 55, 55],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
            halign: "center",
            minCellHeight: 9,
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 9  },
            1: { halign: "center", cellWidth: 22, fontSize: 6.5, textColor: [150, 150, 150] as any },
            2: {                   cellWidth: 63, fontStyle: "bold" },
            3: { halign: "center", cellWidth: 22, fontSize: 6.5, textColor: [150, 150, 150] as any },
            4: { halign: "center", cellWidth: 24 },
            5: { halign: "center", cellWidth: 27 },
          },
          didParseCell: (hd) => {
            if (hd.section !== "body") return
            const c = candidates[hd.row.index]
            if (!c || !c.isLeading) return
            // Green tint on the entire winner row
            hd.cell.styles.fillColor = [236, 253, 245] as any
            if (hd.column.index === 5) {
              hd.cell.styles.textColor = [22, 163, 74] as any
              hd.cell.styles.fontStyle = "bold"
            }
          },
          didDrawCell: (hd) => {
            if (hd.section !== "body") return
            const c = candidates[hd.row.index]
            if (!c) return
            const { x, y: cy, width: cw, height: ch } = hd.cell
            const sz = Math.min(IMG_SIZE, cw - 4, ch - 4)
            const ix = x  + (cw - sz) / 2
            const iy = cy + (ch - sz) / 2
            if (hd.column.index === 1) drawImg(doc, c.profileImage, ix, iy, sz)
            if (hd.column.index === 3) drawImg(doc, c.symbolImage,  ix, iy, sz)
          },
          margin: { left: mx, right: mx },
        })

        y = (doc as any).lastAutoTable.finalY + 10
      })

      // ── 6. SECTION B: Winners Summary (with images, NO share %) ───────────
      if (y > pageH - 60) { doc.addPage(); y = 16 }

      doc.setDrawColor(180, 180, 180)
      doc.line(mx, y, pageW - mx, y)
      y += 8

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(15, 15, 15)
      doc.text("WINNERS SUMMARY", mx, y)
      y += 8

      data.roleResults.forEach((role) => {
        const winners = role.candidates.filter((c) => c.isLeading)
        if (winners.length === 0) return
        if (y > pageH - 50) { doc.addPage(); y = 16 }

        // Green role label bar
        doc.setFillColor(22, 163, 74)
        doc.roundedRect(mx, y - 5, uw, 9, 2, 2, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8.5)
        doc.setTextColor(255, 255, 255)
        doc.text(role.name.toUpperCase(), mx + 4, y)
        y += 6

        // Columns: Photo | Winner Name | Symbol | Votes  (no share)
        // widths:    26  +     96      +   26   +  32   = 180 mm ≈ usable
        const winnerRows = winners.map((w) => [
          w.profileImage ? "" : "No Photo",
          w.name,
          w.symbolImage  ? "" : "No Symbol",
          w.voteCount.toLocaleString(),
        ])

        autoTable(doc, {
          startY: y,
          head: [["Photo", "Winner Name", "Symbol", "Votes"]],
          body: winnerRows,
          theme: "grid",
          styles: {
            minCellHeight: ROW_H + 6,
            valign: "middle",
            lineColor: [180, 230, 200],
            lineWidth: 0.3,
          },
          headStyles: {
            fillColor: [20, 120, 60],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
            halign: "center",
            minCellHeight: 9,
          },
          bodyStyles: {
            fillColor: [240, 253, 244] as any,
            fontStyle: "bold",
            textColor: [20, 20, 20],
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 26, fontSize: 7, textColor: [120, 120, 120] as any },
            1: {                   cellWidth: 96, fontSize: 13, fontStyle: "bold" },
            2: { halign: "center", cellWidth: 26, fontSize: 7, textColor: [120, 120, 120] as any },
            3: { halign: "center", cellWidth: 32, fontSize: 13, fontStyle: "bold" },
          },
          didDrawCell: (hd) => {
            if (hd.section !== "body") return
            const w = winners[hd.row.index]
            if (!w) return
            const { x, y: cy, width: cw, height: ch } = hd.cell
            const sz = Math.min(IMG_SIZE + 4, cw - 5, ch - 5)
            const ix = x  + (cw - sz) / 2
            const iy = cy + (ch - sz) / 2
            if (hd.column.index === 0) drawImg(doc, w.profileImage, ix, iy, sz)
            if (hd.column.index === 2) drawImg(doc, w.symbolImage,  ix, iy, sz)
          },
          margin: { left: mx, right: mx },
        })

        y = (doc as any).lastAutoTable.finalY + 10
      })

      // ── 7. Page footer on every page ───────────────────────────────────────
      const totalPages = (doc as any).internal.pages.length - 1
      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text(
          `Page ${pg} of ${totalPages}  ·  ${data.organizationName}  ·  ${data.electionName}  ·  ${new Date().toLocaleDateString()}`,
          pageW / 2, pageH - 6, { align: "center" }
        )
      }

      doc.save(`results_${data.electionName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.pdf`)
      toast.success("PDF exported successfully")
    } catch (err) {
      console.error("PDF export failed:", err)
      toast.error("Failed to generate PDF export")
    } finally {
      setIsExporting(false)
    }
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

        {/* PDF */}
        <DropdownMenuItem
          onClick={handlePdfExport}
          className="rounded-xl flex items-center gap-3 py-2.5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
            <HugeiconsIcon icon={PdfIcon} className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">PDF Report</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {data.allowCustomBranding && data.orgLogo
                ? "With branding, logo & candidate images"
                : "With candidate images & results"}
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
