import * as React from "react"
import {
  PencilEdit01Icon,
  Delete02Icon,
  UserGroupIcon,
  Image01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CandidateColumn } from "./candidate-columns"
import { formatDistanceToNow } from "date-fns"
import { UserRole } from "@prisma/client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CandidateDetailsSheetProps {
  candidate: CandidateColumn | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: string
  onEdit: (candidate: CandidateColumn) => void
  onDelete: (candidate: CandidateColumn) => void
}

export function CandidateDetailsSheet({
  candidate,
  open,
  onOpenChange,
  userRole,
  onEdit,
  onDelete,
}: CandidateDetailsSheetProps) {
  if (!candidate) return null

  const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF

  return (
    <TooltipProvider delayDuration={300}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className="w-[400px] flex flex-col p-0 border-l shadow-2xl bg-card overflow-x-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-2 py-0.5 font-bold text-[10px] uppercase tracking-widest">
                <HugeiconsIcon icon={UserGroupIcon} className="w-3.5 h-3.5" />
                Candidate Profile
              </Badge>
            </div>
            <SheetTitle className="font-bold text-2xl tracking-tight text-foreground">{candidate.name}</SheetTitle>
            <SheetDescription className="text-sm font-medium opacity-70">
              Detailed configuration for this candidate.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6 py-4">
            {/* Hero Card Style */}
            <div className="relative overflow-hidden rounded-2xl border bg-muted/30 p-6 shadow-sm border-border/50">
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-background shadow-xl ring-4 ring-primary/5">
                  <AvatarImage src={candidate.profileImage || ""} alt={candidate.name} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold uppercase bg-primary/5 text-primary">
                    {candidate.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">{candidate.name}</h3>
                  <Badge variant="secondary" className="font-bold px-3 py-1 text-[10px] uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20 shadow-none">
                    {candidate.role.name}
                  </Badge>
                </div>
              </div>
              
              {/* Subtle background decoration */}
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
                color="currentColor"
              />
            </div>

            {/* Symbol Image */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 px-1">
                Official Election Symbol
              </p>
              <div className="aspect-square rounded-2xl border bg-card flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/50 shadow-inner">
                {candidate.symbolImage ? (
                  <img
                    src={candidate.symbolImage}
                    alt="Symbol"
                    className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <HugeiconsIcon icon={Image01Icon} className="w-12 h-12" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter italic">No Symbol Specified</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Audit Logs */}
            <div className="space-y-4 pb-4">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60 flex items-center gap-2 px-1">
                Integrity Logs
              </p>
              
              <div className="grid gap-3">
                {/* Creator Card */}
                {candidate.createdBy && (
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                      <AvatarImage src={candidate.createdBy?.image || ""} alt={candidate.createdBy?.name || "User"} className="object-cover" />
                      <AvatarFallback className="bg-blue-500/5 text-blue-600 text-[10px] font-bold">
                        {candidate.createdBy?.name?.charAt(0) || candidate.createdBy?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Registered By</p>
                      <p className="text-sm font-semibold truncate leading-tight mt-0.5">
                        {candidate.createdBy?.name || "Unknown User"}
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{candidate.createdBy?.email}</p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>{candidate.createdBy?.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                        Initial
                      </Badge>
                      <p className="text-[9px] font-medium text-muted-foreground opacity-60">
                        {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Updater Card */}
                {candidate.updatedBy && (
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                      <AvatarImage src={candidate.updatedBy?.image || ""} alt={candidate.updatedBy?.name || "User"} className="object-cover" />
                      <AvatarFallback className="bg-purple-500/5 text-purple-600 text-[10px] font-bold">
                        {candidate.updatedBy?.name?.charAt(0) || candidate.updatedBy?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Last Modified By</p>
                      <p className="text-sm font-semibold truncate leading-tight mt-0.5">
                        {candidate.updatedBy?.name || "Unknown User"}
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{candidate.updatedBy?.email}</p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>{candidate.updatedBy?.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                        Modified
                      </Badge>
                      <p className="text-[9px] font-medium text-muted-foreground opacity-60">
                        {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {canManage && (
            <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 sm:flex-row flex-col bg-muted/5">
              <Button
                variant="destructive"
                className="w-full sm:w-1/2 font-bold text-[11px] uppercase tracking-wider rounded-xl h-10 shadow-sm active:scale-95 transition-all"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete(candidate), 300)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                Delete Profile
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-1/2 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 font-bold text-[11px] uppercase tracking-wider rounded-xl h-10 shadow-sm active:scale-95 transition-all"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit(candidate), 300)
                }}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                Edit Candidate
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
