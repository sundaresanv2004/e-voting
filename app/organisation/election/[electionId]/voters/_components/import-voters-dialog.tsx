"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  File01Icon,
  InformationCircleIcon,
  Tick02Icon,
  Cancel01Icon,
  Alert01Icon,
  CheckmarkCircle02Icon,
  SearchListIcon,
  GridIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { verifyVotersBulk, importVotersBulk } from "@/lib/actions/voter"

interface ImportVotersDialogProps {
  electionId: string
  allCategories: { id: string; name: string; code: string }[]
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

export function ImportVotersDialog({ electionId, allCategories }: ImportVotersDialogProps) {
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
      toast.error("Please upload a valid CSV or Excel file")
      return
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
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

        const headers = Object.keys(json[0] as object)
        if (!headers.includes("name")) {
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
      toast.error("Failed to parse file")
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed gap-2">
          <HugeiconsIcon icon={CloudUploadIcon} className="h-4 w-4" />
          <span>Import Voters</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col">
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="font-heading">
            {step === "resolving" ? "Conflicts Detected" : "Bulk Import Voters"}
          </DialogTitle>
          <DialogDescription>
            {step === "resolving"
              ? "Some voters in your file already exist in this election."
              : "Register multiple voters at once via spreadsheet."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* ── UPLOAD ── */}
          {step === "upload" && (
            <>
              {/* Instructions */}
              <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 shrink-0" />
                  Expected Spreadsheet Format
                </div>
                <div className="text-sm text-foreground/80 space-y-3">
                  <p>Your file should include these column headers:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-black uppercase border-emerald-500/20">
                      name (Required)
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-black uppercase border-blue-500/20">
                      unique_id (Optional)
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-black uppercase border-purple-500/20">
                      category (Optional)
                    </Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    The <code className="text-primary font-bold">category</code> column should contain a valid category <strong>code</strong>. If blank or unrecognised, the voter will be treated as a global voter (can vote in all categories).
                    {allCategories.length > 0 && (
                      <span className="block mt-1.5">
                        Available codes:{" "}
                        {allCategories.map((c, i) => (
                          <React.Fragment key={c.id}>
                            <code className="bg-muted px-1 rounded font-bold">{c.code}</code>
                            {i < allCategories.length - 1 && ", "}
                          </React.Fragment>
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-10 transition-all duration-300 cursor-pointer",
                  file
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
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
                  <div className="flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2 relative">
                      <HugeiconsIcon icon={File01Icon} className="w-8 h-8" />
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-background">
                        <HugeiconsIcon icon={Tick02Icon} className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                      <HugeiconsIcon icon={CloudUploadIcon} className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Click or drag file to this area</p>
                      <p className="text-xs text-muted-foreground font-medium">CSV or Excel (max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── VERIFYING / IMPORTING ── */}
          {(step === "verifying" || step === "importing") && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              <Spinner className="size-10 text-primary" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">
                  {step === "verifying" ? "Verifying Data..." : "Importing Records..."}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {step === "verifying"
                    ? "Checking for duplicates, validating categories, and ensuring data integrity."
                    : "Saving the verified voter records to the database."}
                </p>
              </div>
            </div>
          )}

          {/* ── RESOLVING (conflicts) ── */}
          {step === "resolving" && verifyResult && (
            <div className="space-y-4">
              {/* Duplicate warning */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">
                    {verifyResult.duplicateCount} duplicate {verifyResult.duplicateCount === 1 ? "record" : "records"} found
                  </p>
                  <p className="text-xs mt-0.5 opacity-80">
                    These voters already exist in this election and will be skipped automatically.
                  </p>
                </div>
              </div>

              {/* Duplicate list */}
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
                Conflicting Records
              </p>
              <ScrollArea className="h-[180px] rounded-2xl border bg-muted/30 p-2">
                <div className="space-y-2">
                  {verifyResult.duplicates.map((dup, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{dup.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground opacity-70">{dup.uniqueId}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter h-5 shrink-0">
                        DUPLICATE
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Info notices */}
              <InfoNotices verifyResult={verifyResult} cleanCount={cleanCount} />
            </div>
          )}

          {/* ── READY ── */}
          {step === "ready" && verifyResult && (
            <div className="py-10 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-emerald-600">Verification Complete</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  All <span className="text-foreground font-bold">{verifyResult.total}</span> records are clean and ready for import.
                </p>
              </div>
              <div className="w-full">
                <InfoNotices verifyResult={verifyResult} cleanCount={cleanCount} />
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-24 w-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <HugeiconsIcon icon={Tick02Icon} size={48} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight">Import Successful!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  <span className="text-foreground font-black text-lg">{importCount}</span>{" "}
                  voter{importCount !== 1 ? "s" : ""} have been successfully registered for this election.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 flex flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={step === "verifying" || step === "importing"}
          >
            {step === "success" ? "Close" : "Cancel"}
          </Button>

          {step === "upload" && (
            <Button onClick={handleVerify} disabled={!file} className="px-8 font-bold gap-2">
              Verify Data
            </Button>
          )}

          {(step === "resolving" || step === "ready") && (
            <Button
              onClick={handleImport}
              className="px-8 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {step === "resolving"
                ? `Skip Duplicates & Import ${cleanCount}`
                : `Register ${verifyResult?.total ?? 0} Voter${(verifyResult?.total ?? 0) !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Reusable info notices ────────────────────────────────────────────────────

function InfoNotices({
  verifyResult,
  cleanCount,
}: {
  verifyResult: VerifyResult
  cleanCount: number
}) {
  return (
    <div className="space-y-3">
      {/* Clean count summary */}
      <div className="p-4 rounded-2xl border border-dashed text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-bold text-base">{cleanCount}</span>{" "}
          voter{cleanCount !== 1 ? "s" : ""} ready to import
        </p>
      </div>

      {/* Missing IDs info */}
      {verifyResult.missingIdCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400">
          <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            <span className="font-bold">{verifyResult.missingIdCount}</span> record{verifyResult.missingIdCount !== 1 ? "s" : ""} without a Unique ID —
            secure identifiers will be auto-generated.
          </p>
        </div>
      )}

      {/* Invalid category codes info */}
      {verifyResult.invalidCategoryCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400">
          <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            <span className="font-bold">{verifyResult.invalidCategoryCount}</span> voter{verifyResult.invalidCategoryCount !== 1 ? "s" : ""} had
            unrecognised category codes — they will be treated as <strong>global voters</strong>.
          </p>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(verifyResult.categorySummary).length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">
            Category Breakdown
          </p>
          <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
            {Object.entries(verifyResult.categorySummary)
              .filter(([, count]) => count > 0)
              .map(([name, count]) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <HugeiconsIcon icon={GridIcon} className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{name}</span>
                  </div>
                  <Badge variant="secondary" className="shadow-none shrink-0 text-xs">
                    {count} voter{count !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
