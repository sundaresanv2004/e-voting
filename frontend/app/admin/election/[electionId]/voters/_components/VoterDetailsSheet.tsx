"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  PencilEdit01Icon,
  Delete02Icon,
  UserCircleIcon,
  IdentificationIcon,
  Calendar02Icon,
  Tick01Icon,
  Tick02Icon,
  Cancel01Icon,
  Message01Icon,
  Copy01Icon,
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

export type VoterDetails = {
  id: string
  uniqueId: string
  name: string
  image: string | null
  dob: Date | null
  electionId: string
  ballot?: { id: string; createdAt: string | Date } | null
  createdAt: string | Date
  updatedAt?: string | Date
  additionalDetails?: any
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        className="h-3 w-3"
        color="currentColor"
      />
    </Button>
  )
}

interface VoterDetailsSheetProps {
  voter: VoterDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: string
  onEdit: (voter: VoterDetails) => void
  onDelete: (voter: VoterDetails) => void
}

export function VoterDetailsSheet({
  voter,
  open,
  onOpenChange,
  userRole,
  onEdit,
  onDelete,
}: VoterDetailsSheetProps) {
  if (!voter) return null

  const hasVoted = !!voter.ballot
  const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF
  const initials = voter.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

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
              <HugeiconsIcon icon={UserCircleIcon} className="w-3 h-3" />
              Registered Voter
            </Badge>
            <Badge
              variant={hasVoted ? "success" : "secondary"}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
            >
              {hasVoted ? "Voted" : "Not Voted"}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                <AvatarImage src={voter.image || ""} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <SheetTitle className="font-semibold text-xl truncate tracking-tight">{voter.name}</SheetTitle>

            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 py-6">
          {/* Main Info Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-background shadow-sm border flex items-center justify-center text-primary/70">
                  <HugeiconsIcon icon={IdentificationIcon} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Unique Identifier</p>
                  <p className="text-lg font-bold text-foreground font-mono truncate">
                    {voter.uniqueId}
                  </p>
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-1 rounded-xl border shrink-0">
                <CopyButton text={voter.uniqueId} />
              </div>
            </div>


            {/* Subtle background decoration */}
            <HugeiconsIcon
              icon={IdentificationIcon}
              className="absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] rotate-12"
              color="currentColor"
            />
          </div>

          <Separator className="border-dashed" />

          {/* Voting Status Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Voting Status</h4>
            <div className={cn(
                "flex items-center gap-4 rounded-xl border p-4 transition-all group relative overflow-hidden",
                hasVoted ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-dashed"
            )}>
                <div className={cn(
                    "absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity",
                    hasVoted ? "bg-green-500/10" : "bg-muted/20"
                )} />
                <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                    hasVoted ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                    <HugeiconsIcon icon={hasVoted ? Tick01Icon : Cancel01Icon} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-sm font-bold group-hover:text-foreground transition-colors">{hasVoted ? "Ballot Cast" : "Waiting for Ballot"}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {hasVoted
                            ? "This voter has successfully authenticated and cast their ballot."
                            : "This voter is registered but has not participated in the election yet."}
                    </p>
                </div>
                {hasVoted && voter.ballot?.createdAt && (
                  <div className="text-right shrink-0 relative z-10">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter bg-green-500/10 text-green-600 border-none">
                      Cast
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap mt-1">
                      {format(new Date(voter.ballot.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Additional Details (JSON) */}
          {voter.additionalDetails && Object.keys(voter.additionalDetails).length > 0 && (
            <>
                <Separator className="border-dashed" />
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1 flex items-center gap-2">
                        <HugeiconsIcon icon={Message01Icon} className="w-3 h-3" />
                        Additional Metadata
                    </h4>
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                        {Object.entries(voter.additionalDetails).map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider leading-none mb-1.5">{key}</span>
                                <span className="text-sm font-medium">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
          )}

          <Separator className="border-dashed" />

          {/* Integrity Logs */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1 text-foreground/80">Integrity Logs</h4>
            <div className="grid gap-3">
              {/* Registered Card */}
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10 group relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:scale-105 transition-transform duration-300">
                  <HugeiconsIcon icon={Calendar02Icon} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left relative z-10">
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="text-sm font-medium leading-tight mt-0.5 group-hover:text-foreground transition-colors">
                    {voter.createdAt ? format(new Date(voter.createdAt), "MMMM d, yyyy") : "Unknown"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0 relative z-10">
                  <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter bg-blue-500/10 text-blue-600 border-none">
                    Created
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {voter.createdAt ? format(new Date(voter.createdAt), "h:mm a") : "Unknown"}
                  </p>
                </div>
              </div>

              {/* Last Updated Card */}
              {voter.updatedAt && (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-purple-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform duration-300">
                    <HugeiconsIcon icon={Calendar02Icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left relative z-10">
                    <p className="text-xs text-muted-foreground">Last Modified</p>
                    <p className="text-sm font-medium leading-tight mt-0.5 group-hover:text-foreground transition-colors">
                      {format(new Date(voter.updatedAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1 shrink-0 relative z-10">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter bg-purple-500/10 text-purple-600 border-none">
                      Modified
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {format(new Date(voter.updatedAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 bg-muted/5 lg:backdrop-blur-sm flex flex-row shrink-0">
            <Button
              variant="outline"
              className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onDelete(voter), 300)
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 shrink-0" color="currentColor" />
              Remove
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-w-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onEdit(voter), 300)
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 shrink-0" color="currentColor" />
              Edit Voter
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
