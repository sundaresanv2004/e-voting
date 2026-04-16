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
  DocumentValidationIcon,
  Alert01Icon,
  CheckmarkCircle02Icon,
  SearchListIcon
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { verifyVotersBulk, importVotersBulk } from "../_actions"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImportVotersDialogProps {
  electionId: string
}

type ImportStep = "upload" | "verifying" | "resolving" | "ready" | "importing" | "success"

interface DuplicateVoter {
  uniqueId: string
  name: string
}

export function ImportVotersDialog({ electionId }: ImportVotersDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [step, setStep] = React.useState<ImportStep>("upload")
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedData, setParsedData] = React.useState<any[]>([])
  const [duplicates, setDuplicates] = React.useState<DuplicateVoter[]>([])
  const [importResults, setImportResults] = React.useState<{ count: number } | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("upload")
        setFile(null)
        setParsedData([])
        setDuplicates([])
        setImportResults(null)
      }, 300)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ]

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast.error("Please upload a valid CSV or Excel file")
        return
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setFile(selectedFile)
    }
  }

  const handleVerify = async () => {
    if (!file) return

    setStep("verifying")

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)

        if (json.length === 0) {
          toast.error("The spreadsheet is empty")
          setStep("upload")
          return
        }

        // Validate headers
        const headers = Object.keys(json[0] as object)
        if (!headers.includes("unique_id") || !headers.includes("name")) {
          toast.error("Missing required columns: unique_id and name")
          setStep("upload")
          return
        }

        // Sanitize data for Server Action (remove non-plain objects/methods from XLSX)
        const sanitizedData = JSON.parse(JSON.stringify(json))
        setParsedData(sanitizedData)

        // Call server-side verification
        const result = await verifyVotersBulk(electionId, sanitizedData)

        if (result.error) {
          toast.error(result.error)
          setStep("upload")
          return
        }

        if (result.duplicateCount && result.duplicateCount > 0) {
          setDuplicates(result.duplicates || [])
          setStep("resolving")
        } else {
          setStep("ready")
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error("PARSING_ERROR:", error)
      toast.error("Failed to parse file")
      setStep("upload")
    }
  }

  const handleImport = async () => {
    // Filter out duplicates before sending to server
    const duplicateIds = new Set(duplicates.map(d => d.uniqueId))
    const cleanData = parsedData.filter(v => !duplicateIds.has(String(v.unique_id)))

    if (cleanData.length === 0) {
      toast.error("No valid records to import")
      return
    }

    // Sanitize data for Server Action (already sanitized once, but good practice if manipulated)
    const cleanDataForServer = JSON.parse(JSON.stringify(cleanData))
    setStep("importing")

    try {
      const result = await importVotersBulk(electionId, cleanDataForServer)
      if (result.success) {
        setImportResults({ count: result.count || 0 })
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <HugeiconsIcon icon={CloudUploadIcon} className="h-4 w-4" />
          <span>Upload Data</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col border-none shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-card relative gap-1 overflow-hidden">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            {step === "resolving" ? "Conflict Detected" : "Bulk Import Voters"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {step === "resolving"
              ? "Some voters in your file already exist in this election."
              : "Register multiple voters at once via spreadsheet."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-card">
          {/* STEP 1: UPLOAD */}
          {step === "upload" && (
            <>
              <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm uppercase tracking-widest">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4" />
                  Formatting Rules
                </div>
                <div className="text-sm text-foreground/80 space-y-2">
                  <p>Your spreadsheet should include these column headers:</p>
                  <div className="flex flex-wrap gap-2 pt-1 pb-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-black uppercase border-emerald-500/20 px-2 py-0.5">name (Required)</Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-black uppercase border-blue-500/20 px-2 py-0.5">unique_id (Optional)</Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    If the <code className="text-primary font-bold">unique_id</code> column is missing or empty for a row, our system will automatically generate a secure, non-repeating identifier for that voter.
                  </p>
                </div>

              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-10 transition-all duration-300 cursor-pointer overflow-hidden",
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
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
                    <Button variant="ghost" size="sm" onClick={removeFile} className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-2 gap-1.5 z-10">
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

          {/* STEP: VERIFYING / IMPORTING */}
          {(step === "verifying" || step === "importing") && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl border-4 border-primary/20 border-t-primary animate-spin" />
                <HugeiconsIcon icon={SearchListIcon} className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">
                  {step === "verifying" ? "Verifying Data Identity..." : "Finalizing Secure Import..."}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {step === "verifying"
                    ? "We are checking your spreadsheet for duplicates and ensuring data integrity."
                    : "Almost there! We are saving the verified voter records to the database."}
                </p>
              </div>
            </div>
          )}

          {/* STEP: CONFLICTS */}
          {step === "resolving" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">
                  Found {duplicates.length} duplicate records. They will be skipped automatically.
                </p>
              </div>

              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 py-1">Conflicting Records</p>
              <ScrollArea className="h-[250px] rounded-2xl border bg-muted/30 p-2">
                <div className="space-y-2">
                  {duplicates.map((dup, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{dup.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground opacity-70">{dup.uniqueId}</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter h-5">DUPLICATE</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 rounded-xl border border-dashed text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  The remaining <span className="text-foreground font-bold">{parsedData.length - duplicates.length}</span> voters are unique and ready for import.
                </p>
              </div>
            </div>
          )}

          {/* STEP: READY */}
          {step === "ready" && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 scale-110">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-emerald-600">Verification Complete</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  All <span className="text-foreground font-bold">{parsedData.length}</span> records are clean and verified for import.
                </p>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === "success" && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="h-24 w-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <HugeiconsIcon icon={Tick02Icon} size={48} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight">Import Successful</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  <span className="text-foreground font-black text-lg">{importResults?.count}</span> voters have been successfully registered for this election.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-3 bg-card">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={step === "verifying" || step === "importing"}>
            {step === "success" ? "Close" : "Cancel"}
          </Button>

          {step === "upload" && (
            <Button onClick={handleVerify} disabled={!file} className="px-8 font-bold gap-2 active:scale-95 transition-all">
              Verify Data
            </Button>
          )}

          {(step === "resolving" || step === "ready") && (
            <Button onClick={handleImport} className="px-8 font-bold gap-2 active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-700">
              {step === "resolving" ? `Skip Duplicates & Import ${parsedData.length - duplicates.length}` : `Register ${parsedData.length} Voters`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

