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
          className="w-[420px] flex flex-col p-0 border-l shadow-2xl bg-background overflow-x-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Close Button - Floating */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-50 text-white hover:text-white/80 transition-colors p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm"
            >
              ✕
            </button>

            {/* Profile Section - Portfolio-Sized Hero Image */}
            <div className="relative w-full h-[650px] overflow-hidden flex-shrink-0">
              {/* Background Image */}
              <div className="absolute inset-0">
                {candidate.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <div className="text-6xl font-bold text-white/30">
                      {candidate.name.substring(0, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Gradient Overlay - Bottom (thickens towards bottom) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* Content - Positioned at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-3xl font-bold mb-3">{candidate.name}</h3>
                <Badge className="text-sm font-bold px-4 py-2 bg-white/20 text-white border border-white/40 backdrop-blur-md shadow-lg hover:bg-white/30 transition-all">
                  {candidate.role.name}
                </Badge>
              </div>
            </div>

            {/* Election Symbol - Dedicated Section */}
            <div className="px-6 py-6 border-b border-border/30">
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-black text-muted-foreground tracking-widest">Election Symbol</h4>
                <div className="aspect-video rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center overflow-hidden">
                  {candidate.symbolImage ? (
                    <img
                      src={candidate.symbolImage}
                      alt="Symbol"
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={Image01Icon} className="w-10 h-10 opacity-50" />
                      <p className="text-xs font-medium opacity-60">No symbol assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Timeline - Modern Design */}
            <div className="px-6 py-6">
              <h4 className="text-xs uppercase font-black text-muted-foreground tracking-widest mb-5">Activity Timeline</h4>
              <div className="space-y-4">
                {/* Created Entry */}
                {candidate.createdBy && (
                  <div className="relative">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="w-0.5 h-12 bg-border/50 mt-2" />
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-bold text-foreground">Profile Created</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border-emerald-500/30 whitespace-nowrap">
                            CREATED
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-3 p-3 bg-muted/40 rounded-lg">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={candidate.createdBy?.image || ""} alt={candidate.createdBy?.name || "User"} />
                            <AvatarFallback className="text-xs bg-emerald-500 text-white font-bold">
                              {candidate.createdBy?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{candidate.createdBy?.name || "Unknown"}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[11px] text-muted-foreground truncate cursor-help">
                                  {candidate.createdBy?.email}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{candidate.createdBy?.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Updated Entry */}
                {candidate.updatedBy && (
                  <div className="relative">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-bold text-foreground">Profile Updated</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 text-blue-700 border-blue-500/30 whitespace-nowrap">
                            UPDATED
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-3 p-3 bg-muted/40 rounded-lg">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={candidate.updatedBy?.image || ""} alt={candidate.updatedBy?.name || "User"} />
                            <AvatarFallback className="text-xs bg-blue-500 text-white font-bold">
                              {candidate.updatedBy?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{candidate.updatedBy?.name || "Unknown"}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[11px] text-muted-foreground truncate cursor-help">
                                  {candidate.updatedBy?.email}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{candidate.updatedBy?.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {canManage && (
            <div className="sticky bottom-0 border-t border-border/30 bg-background/95 backdrop-blur-sm p-6 flex flex-col gap-3">
              <Button
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit(candidate), 300)
                }}
                className="w-full h-11 font-semibold text-sm rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                Edit Candidate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete(candidate), 300)
                }}
                className="w-full h-11 font-semibold text-sm rounded-lg border-red-500/30 text-red-600 hover:bg-red-500/10 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                Delete Profile
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
