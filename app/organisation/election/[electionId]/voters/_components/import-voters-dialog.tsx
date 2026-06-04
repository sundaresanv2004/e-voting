"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  File01Icon,
  Tick02Icon,
  Cancel01Icon,
  Alert01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { verifyVotersBulk, importVotersBulk } from "@/lib/actions/voter"

interface ImportVotersDialogProps {
  electionId: string
  allCategories: { id: string; name: string; code: string }[]
  trigger?: React.ReactNode
}

type ImportStep = "upload" | "verifying" | "resolving" | "ready" | "importing" | "success"

interface DuplicateVoter {
  uniqueId: string
  name: string
}

interface VerifyResult {
  total: number
  cleanCount: number
  duplicateCount: number
  missingIdCount: number
  invalidCategoryCount: number
  categorySummary: Record<string, number>
  duplicates: DuplicateVoter[]
}

export function ImportVotersDialog({ electionId, allCategories, trigger }: ImportVotersDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedData, setParsedData] = React.useState<any[]>([])
  const [verifyResult, setVerifyResult] = React.useState<VerifyResult | null>(null)
  const [importCount, setImportCount] = React.useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("upload")
        setFile(null)
        setParsedData([])
        setVerifyResult(null)
        setImportCount(null)
      }, 300)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!validTypes.includes(selected.type) && !selected.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV or Excel file")
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB")
      return
    }
    setFile(selected)
  }

  const handleVerify = async () => {
    if (!file) return
    setStep("verifying")
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const json: any[] = XLSX.utils.sheet_to_json(worksheet)

        if (json.length === 0) {
          toast.error("The spreadsheet is empty")
          setStep("upload")
          return
        }
        if (!Object.keys(json[0] as object).includes("name")) {
          toast.error('Missing required column: "name"')
          setStep("upload")
          return
        }

        const sanitized = JSON.parse(JSON.stringify(json))
        setParsedData(sanitized)

        const result = await verifyVotersBulk(electionId, sanitized, allCategories)
        if ("error" in result) {
          toast.error(result.error)
          setStep("upload")
          return
        }

        setVerifyResult(result as VerifyResult)
        setStep(result.duplicateCount > 0 ? "resolving" : "ready")
      }
      reader.readAsArrayBuffer(file)
    } catch {
      toast.error("Failed to read file")
      setStep("upload")
    }
  }

  const handleImport = async () => {
    const duplicateIds = new Set((verifyResult?.duplicates ?? []).map((d) => d.uniqueId))
    const cleanData = parsedData.filter((v) => !duplicateIds.has(String(v.unique_id ?? "")))

    if (cleanData.length === 0) {
      toast.error("No valid records to import")
      return
    }

    setStep("importing")
    try {
      const result = await importVotersBulk(electionId, JSON.parse(JSON.stringify(cleanData)), allCategories)
      if (result.success) {
        setImportCount(result.count ?? 0)
        setStep("success")
        toast.success(result.message)
      } else {
        toast.error(result.error || "Import failed")
        setStep("ready")
      }
    } catch {
      toast.error("An unexpected error occurred")
      setStep("ready")
    }
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const cleanCount = (verifyResult?.total ?? 0) - (verifyResult?.duplicateCount ?? 0)
  const isBusy = step === "verifying" || step === "importing"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <Button variant="outline" className="border-dashed gap-2">
            <HugeiconsIcon icon={CloudUploadIcon} className="h-4 w-4" />
            Import Voters
          </Button>
        )}
      </div>

      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-bold tracking-tight">
            {step === "resolving"
              ? "Duplicates Found"
              : step === "success"
                ? "Import Complete"
                : "Import Voters"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === "upload" && "Upload a CSV or Excel file to register multiple voters at once."}
            {step === "verifying" && "Checking your file for issues…"}
            {step === "resolving" && `${verifyResult?.duplicateCount} voter${verifyResult?.duplicateCount !== 1 ? "s" : ""} in your file already exist and will be skipped.`}
            {step === "ready" && `${verifyResult?.total} voter${verifyResult?.total !== 1 ? "s" : ""} ready to import.`}
            {step === "importing" && "Saving records to the database…"}
            {step === "success" && `${importCount} voter${importCount !== 1 ? "s" : ""} successfully registered.`}
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">

          {/* ── UPLOAD ── */}
          {step === "upload" && (
            <>
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 gap-3 cursor-pointer transition-colors duration-200",
                  file
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />

                {file ? (
                  <>
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 relative">
                      <HugeiconsIcon icon={File01Icon} className="w-6 h-6" />
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-background">
                        <HugeiconsIcon icon={Tick02Icon} className="w-2.5 h-2.5" strokeWidth={3} />
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                      <HugeiconsIcon icon={CloudUploadIcon} className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Click to choose a file</p>
                      <p className="text-xs text-muted-foreground">CSV or Excel · max 5 MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Compact format hint */}
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-1.5">
                <p className="font-semibold text-foreground">Required column</p>
                <p><code className="font-mono bg-background px-1 rounded">name</code> — voter's full name</p>
                <p className="font-semibold text-foreground pt-1">Optional columns</p>
                <p>
                  <code className="font-mono bg-background px-1 rounded">unique_id</code> — admission ID (auto-generated if blank)
                </p>
                {allCategories.length > 0 && (
                  <div className="space-y-0.5">
                    <p>
                      <code className="font-mono bg-background px-1 rounded">category</code> — leave empty to allow voting in <span className="text-foreground font-medium">any category</span>, or enter a category code to restrict to a specific one.
                    </p>
                  </div>
                )}
                <div className="border-t border-border/50 mt-2 pt-2">
                  <p className="text-muted-foreground/80">
                    Any other columns you include — such as <span className="text-foreground font-medium">class</span> or <span className="text-foreground font-medium">section</span> — will be saved as additional details and shown alongside the voter's profile during the election for easier identification.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── VERIFYING / IMPORTING ── */}
          {isBusy && (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <Spinner className="size-8 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                {step === "verifying" ? "Checking for duplicates and validating data…" : "Saving voter records…"}
              </p>
            </div>
          )}

          {/* ── CONFLICTS ── */}
          {step === "resolving" && verifyResult && (
            <div className="space-y-3">
              {/* Summary stat row */}
              <div className="grid grid-cols-2 gap-3">
                <StatPill label="To import" value={cleanCount} color="emerald" />
                <StatPill label="Skipped (duplicates)" value={verifyResult.duplicateCount} color="amber" />
              </div>

              {/* Duplicate list */}
              <div className="rounded-xl border bg-muted/30 overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/50">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Conflicting records
                  </p>
                </div>
                <div className="max-h-44 overflow-y-auto divide-y divide-border/50">
                  {verifyResult.duplicates.map((dup, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{dup.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{dup.uniqueId}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        EXISTS
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category summary */}
              <CategorySummary categorySummary={verifyResult.categorySummary} />

              {verifyResult.missingIdCount > 0 && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <HugeiconsIcon icon={Alert01Icon} className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                  {verifyResult.missingIdCount} voter{verifyResult.missingIdCount !== 1 ? "s" : ""} without an ID — unique IDs will be auto-generated.
                </p>
              )}
            </div>
          )}

          {/* ── READY ── */}
          {step === "ready" && verifyResult && (
            <div className="space-y-4">
              <div className="py-4 flex flex-col items-center gap-3 text-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
                </div>
                <div>
                  <p className="text-3xl font-black tabular-nums">{verifyResult.total}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    voter{verifyResult.total !== 1 ? "s" : ""} ready to register
                  </p>
                </div>
                {verifyResult.missingIdCount > 0 && (
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {verifyResult.missingIdCount} without an ID will receive an auto-generated one.
                  </p>
                )}
              </div>
              {/* Category summary */}
              <CategorySummary categorySummary={verifyResult.categorySummary} />
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <HugeiconsIcon icon={Tick02Icon} size={32} strokeWidth={3} />
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums">{importCount}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  voter{importCount !== 1 ? "s" : ""} registered successfully
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex flex-row gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            disabled={isBusy}
          >
            {step === "success" ? "Done" : "Cancel"}
          </Button>

          {step === "upload" && (
            <Button onClick={handleVerify} disabled={!file} className="px-6 font-semibold">
              Verify File
            </Button>
          )}

          {(step === "resolving" || step === "ready") && (
            <Button
              onClick={handleImport}
              className="px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {step === "resolving"
                ? `Import ${cleanCount} Voter${cleanCount !== 1 ? "s" : ""}`
                : `Register ${verifyResult?.total ?? 0} Voter${(verifyResult?.total ?? 0) !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Tiny stat pill ────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: "emerald" | "amber"
}) {
  const styles = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  }

  return (
    <div className={cn("rounded-xl px-4 py-3 text-center", styles[color])}>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

// ── Category summary ──────────────────────────────────────────────────────────

function CategorySummary({ categorySummary }: { categorySummary: Record<string, number> }) {
  const entries = Object.entries(categorySummary).filter(([, count]) => count > 0)
  if (entries.length === 0) return null

  return (
    <div className="rounded-xl border bg-muted/30 overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/50">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Category breakdown
        </p>
      </div>
      <div className="divide-y divide-border/50">
        {entries.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between px-3 py-2.5">
            <p className="text-xs font-medium truncate">{name}</p>
            <span className="ml-2 shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
              {count} voter{count !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
