"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  PencilEdit01Icon,
  Delete02Icon,
  UserGroupIcon,
  Image01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserRole } from "@prisma/client"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CandidateColumn } from "./candidate-columns"

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
        className="w-[400px] flex flex-col p-0 bg-card"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-2 py-0.5">
              <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
              Candidate
            </Badge>
          </div>
          <SheetTitle className="font-semibold text-xl wrap-break-word">{candidate.name}</SheetTitle>
          <SheetDescription>
            Detailed profile for this election candidate.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 py-6">
          {/* Candidate Identity Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
            <div className="relative z-10 space-y-4 w-full">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 shadow-sm border border-border/50 shrink-0">
                  <AvatarImage src={candidate.profileImage || ""} alt={candidate.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                    {candidate.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Contesting For</p>
                  <p className="text-xl font-bold text-foreground block">
                    {candidate.role.name}
                  </p>
                </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="grid grid-cols-1 gap-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  This candidate is contesting for the <span className="font-bold">{candidate.role.name}</span> position in this election.
                </p>
              </div>
            </div>
            {/* Subtle background decoration */}
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
              color="currentColor"
            />
          </div>

          <Separator className="border-dashed" />

          {/* Profile Image Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
              <HugeiconsIcon icon={Image01Icon} className="h-4 w-4 text-muted-foreground" />
              Profile Image
            </h4>
            <div className="grid gap-3">
              {candidate.profileImage ? (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <Avatar className="h-16 w-16 shadow-sm border border-border/50 shrink-0 rounded-xl">
                    <AvatarImage src={candidate.profileImage} alt={candidate.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-xl">
                      {candidate.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Uploaded Photo</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      {candidate.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed bg-muted/5">
                  <HugeiconsIcon icon={Image01Icon} className="h-8 w-8 mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    No profile image has been uploaded.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Election Symbol Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
              <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4 text-muted-foreground" />
              Election Symbol
            </h4>
            <div className="grid gap-3">
              {candidate.symbolImage ? (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="h-16 w-16 shrink-0 rounded-xl border bg-background flex items-center justify-center overflow-hidden">
                    <img
                      src={candidate.symbolImage}
                      alt="Symbol"
                      className="max-h-full max-w-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Assigned Symbol</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      Election Symbol
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed bg-muted/5">
                  <HugeiconsIcon icon={Tag01Icon} className="h-8 w-8 mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    No election symbol has been assigned.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Integrity Logs & Metadata */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1">Integrity Logs</h4>
            <div className="grid gap-3">
              {/* Creator Card */}
              {candidate.createdBy && (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                    <AvatarImage src={candidate.createdBy.image || ""} alt={candidate.createdBy.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-green-500/5 text-green-600 text-[10px] font-bold">
                      {candidate.createdBy.name?.charAt(0) || candidate.createdBy.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      {candidate.createdBy.name || "Unknown User"}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{candidate.createdBy.email}</p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{candidate.createdBy.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                      Creator
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {candidate.createdAt ? format(new Date(candidate.createdAt), "MMM d, h:mm a") : "Unknown"}
                    </p>
                  </div>
                </div>
              )}

              {/* Updater Card */}
              {candidate.updatedBy && (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                    <AvatarImage src={candidate.updatedBy.image || ""} alt={candidate.updatedBy.name || "User"} className="object-cover" />
                    <AvatarFallback className="bg-purple-500/5 text-purple-600 text-[10px] font-bold">
                      {candidate.updatedBy.name?.charAt(0) || candidate.updatedBy.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Last Modified By</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      {candidate.updatedBy.name || "Unknown User"}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{candidate.updatedBy.email}</p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{candidate.updatedBy.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                      Modified
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {candidate.updatedAt ? format(new Date(candidate.updatedAt), "MMM d, h:mm a") : "Unknown"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 bg-muted/5 lg:backdrop-blur-sm flex flex-row">
            <Button
              variant="outline"
              className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onDelete(candidate), 300)
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 shrink-0" color="currentColor" />
              Delete
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-w-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onEdit(candidate), 300)
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 shrink-0" color="currentColor" />
              Edit Candidate
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
