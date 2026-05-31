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

      // ── 1. Helper: load an image robustly via Canvas ───────────────────────
      // We fetch as a blob first to bypass cross-origin cache issues, 
      // convert to ObjectURL, and draw to canvas to force it into a JPEG.
      // This ensures jsPDF never chokes on unsupported WEBP images.
      const loadNativeImage = async (url: string | null): Promise<string | null> => {
        if (!url) return null
        
        // Proxy through our internal API to avoid cross-origin issues during canvas rendering
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`

        return new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas")
              canvas.width = img.naturalWidth
              canvas.height = img.naturalHeight
              const ctx = canvas.getContext("2d")
              if (ctx) {
                ctx.fillStyle = "#ffffff"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
                resolve(canvas.toDataURL("image/jpeg", 0.95))
              } else {
                resolve(proxyUrl) // Fallback to raw proxy URL
              }
            } catch (e) {
              console.warn("Canvas rendering error:", e)
              resolve(proxyUrl) // Fallback to raw proxy URL on taint
            }
          }
          img.onerror = () => {
            console.warn("Image load error, falling back to proxy URL:", proxyUrl)
            resolve(proxyUrl) // Fallback to raw proxy URL
          }
          // Avoid browser caching the non-cors version
          img.src = proxyUrl + "&t=" + Date.now()
        })
      }

      // Pre-load all required images
      const imgCache = new Map<string, string>()
      const cacheImg = async (url: string | null) => {
        if (!url || imgCache.has(url)) return
        const img = await loadNativeImage(url)
        if (img) imgCache.set(url, img)
      }

      if (data.allowCustomBranding && data.orgLogo) {
        await cacheImg(data.orgLogo)
      }
      for (const role of data.roleResults) {
        for (const c of role.candidates) {
          if (c.isLeading) { // We only need images for winners now
            await cacheImg(c.profileImage)
            await cacheImg(c.symbolImage)
          }
        }
      }

      // ── 2. Helper: draw cached image into the PDF ─────────────────────────
      const drawImg = (
        d: InstanceType<typeof jsPDF>,
        url: string | null,
        x: number,
        y: number,
        size: number,
        customHeight?: number
      ) => {
        if (!url) return
        const b64 = imgCache.get(url)
        if (!b64) return
        try {
          d.addImage(b64, "JPEG", x, y, size, customHeight || size)
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
            // Organization logos use a 16:4 aspect ratio (variant="rectangle")
            const logoW = 96
            const logoH = 24
            drawImg(doc, data.orgLogo, (pageW - logoW) / 2, y, logoW, logoH)
            y += logoH + 8
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

      // Draw title text
      doc.setFontSize(8.5)
      const titleText = "Official Election Results  "
      const titleW = doc.getTextWidth(titleText)
      const startX = (pageW - titleW) / 2
      
      doc.setTextColor(130, 130, 130)
      doc.text(titleText, startX, y)
      
      // Draw manual green checkmark
      doc.setDrawColor(22, 163, 74) // green-600
      doc.setLineWidth(0.8)
      const tickX = startX + titleW - 1
      const tickY = y - 1
      doc.line(tickX, tickY - 1, tickX + 1.5, tickY + 0.5) // short leg
      doc.line(tickX + 1.5, tickY + 0.5, tickX + 4, tickY - 2.5) // long leg
      y += 8

      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.5)
      doc.line(mx, y, pageW - mx, y)
      y += 10

      // ── 5. ELECTION SUMMARY ───────────────────────────────────────────────
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(15, 15, 15)
      doc.text("ELECTION SUMMARY", mx, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [["Total Voters", "Ballots Cast", "Voter Turnout", "Positions", "Candidates"]],
        body: [[
          data.stats.totalVoters.toLocaleString(),
          data.stats.ballotsCast.toLocaleString(),
          `${data.stats.turnoutPercentage.toFixed(1)}%`,
          data.stats.totalRoles.toString(),
          data.stats.totalCandidates.toString(),
        ]],
        theme: "grid",
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "center",
        },
        bodyStyles: { fontSize: 10, fontStyle: "bold", halign: "center", textColor: [30, 30, 30] },
        margin: { left: mx, right: mx },
      })
      y = (doc as any).lastAutoTable.finalY + 12

      // ── 6. SECTION A: Results by Position (NO IMAGES) ───────────────────
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(15, 15, 15)
      doc.text("RESULTS BY POSITION", mx, y)
      y += 8

      data.roleResults.forEach((role, rIdx) => {
        if (y > pageH - 45) { doc.addPage(); y = 16 }

        doc.setFillColor(245, 245, 245)
        doc.roundedRect(mx, y - 5, uw, 10, 2, 2, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(30, 30, 30)
        doc.text(
          `${String(rIdx + 1).padStart(2, "0")}  ${role.name.toUpperCase()}`,
          mx + 4, y + 1.5
        )
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text(
          `${role.candidates.length} candidates  ·  ${role.totalVotes.toLocaleString()} total votes`,
          pageW - mx - 4, y + 1.5, { align: "right" }
        )
        y += 9

        const candidates = role.candidates
        const rows = candidates.map((c, i) => [
          String(i + 1),
          c.name,
          c.voteCount.toLocaleString(),
          `${c.percentage.toFixed(1)}%`,
          c.isLeading ? "WINNER" : "",
        ])

        autoTable(doc, {
          startY: y,
          head: [["#", "Candidate Name", "Votes", "Share %", "Status"]],
          body: rows,
          theme: "striped",
          styles: { fontSize: 9, lineColor: [230, 230, 230] },
          headStyles: {
            fillColor: [70, 70, 70],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
            halign: "center",
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 12 },
            1: { cellWidth: 80, fontStyle: "bold" },
            2: { halign: "center", cellWidth: 25 },
            3: { halign: "center", cellWidth: 25 },
            4: { halign: "center", cellWidth: 30 },
          },
          didParseCell: (hd) => {
            if (hd.section !== "body") return
            const c = candidates[hd.row.index]
            if (!c || !c.isLeading) return
            hd.cell.styles.fillColor = [240, 253, 244] as any // very light green
            if (hd.column.index === 4) {
              hd.cell.styles.textColor = [22, 163, 74] as any // emerald-600
              hd.cell.styles.fontStyle = "bold"
            }
          },
          margin: { left: mx, right: mx },
        })

        y = (doc as any).lastAutoTable.finalY + 10
      })

      // ── 7. SECTION B: Winners Summary (WITH IMAGES) ───────────────────────
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
            const maxH = Math.min(IMG_SIZE + 4, ch - 4)
            // Candidate images use a 3:4 aspect ratio
            const imgH = maxH
            const imgW = maxH * 0.75
            const ix = x  + (cw - imgW) / 2
            const iy = cy + (ch - imgH) / 2
            if (hd.column.index === 0) drawImg(doc, w.profileImage, ix, iy, imgW, imgH)
            if (hd.column.index === 2) drawImg(doc, w.symbolImage,  ix, iy, imgW, imgH)
          },
          margin: { left: mx, right: mx },
        })

        y = (doc as any).lastAutoTable.finalY + 10
      })

      // ── 8. Fetch IP for footer ────────────────────────────────────────────
      let ip = "0.0.0.0"
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json")
        if (ipRes.ok) {
          const ipData = await ipRes.json()
          ip = ipData.ip || "0.0.0.0"
        }
      } catch (e) {}
      
      const appUrl = typeof window !== "undefined" ? window.location.host : "e-voting-platform.com"

      // ── 9. Page footer on every page ───────────────────────────────────────
      const totalPages = (doc as any).internal.pages.length - 1
      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg)
        
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text(
          `Page ${pg} of ${totalPages}  |  ${data.electionName}  |  ${new Date().toLocaleString()}  |  IP: ${ip}  |  Source: ${appUrl}`,
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
