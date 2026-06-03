"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  LockKeyIcon, 
  GridIcon, 
  Globe02Icon, 
  ComputerIcon, 
  Location01Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Delete02Icon } from "@hugeicons/core-free-icons"

import { type AnonymousBallotRow } from "./anonymous-ballots-table"

interface AnonymousBallotSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ballot: AnonymousBallotRow | null
  canManage?: boolean
  onDelete?: (ballot: AnonymousBallotRow) => void
}

// ─── Browser parser ───────────────────────────────────────────────────────────

function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown"
  if (/Edg\//i.test(ua)) return "Microsoft Edge"
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "Opera"
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Google Chrome"
  if (/Firefox\//i.test(ua)) return "Mozilla Firefox"
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari"
  if (/MSIE|Trident\//i.test(ua)) return "Internet Explorer"
  return "Unknown Browser"
}

function parseOS(ua: string | null): string {
  if (!ua) return "Unknown"
  if (/Windows NT/i.test(ua)) return "Windows"
  if (/Mac OS X/i.test(ua)) return "macOS"
  if (/Android/i.test(ua)) return "Android"
  if (/iPhone|iPad/i.test(ua)) return "iOS"
  if (/Linux/i.test(ua)) return "Linux"
  return "Unknown OS"
}

export function AnonymousBallotSheet({
  open,
  onOpenChange,
  ballot,
  canManage,
  onDelete,
}: AnonymousBallotSheetProps) {
  if (!ballot) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="shadow-none bg-muted gap-1.5">
              <HugeiconsIcon icon={LockKeyIcon} className="size-3" />
              Anonymous
            </Badge>
          </div>
          <SheetTitle className="font-heading text-2xl leading-snug break-words">
            Ballot Details
          </SheetTitle>
          <SheetDescription className="sr-only">
            Details of an anonymous vote submission.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          
          {/* Submission Key Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Submission Key
                </p>
                <code className="text-lg font-mono tracking-wider text-foreground block truncate">
                  {ballot.submissionKey}
                </code>
              </div>
            </div>
            <HugeiconsIcon
              icon={LockKeyIcon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Vote Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Globe02Icon} className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Technical Data</h4>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(ballot.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
              {/* Category voted under */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={GridIcon} className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Voted Under Category
                  </p>
                  {ballot.category ? (
                    <p className="text-sm font-medium leading-tight mt-0.5">
                      {ballot.category.name}
                      <code className="ml-2 text-[10px] font-mono text-muted-foreground">{ballot.category.code}</code>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-tight mt-0.5">Global</p>
                  )}
                </div>
              </div>

              {/* IP Address */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    IP Address
                  </p>
                  <code className="text-sm font-mono leading-tight mt-0.5 block truncate">
                    {ballot.ipAddress ?? "Not recorded"}
                  </code>
                </div>
              </div>

              {/* Browser / OS */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={ComputerIcon} className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Browser / OS
                  </p>
                  <p className="text-sm font-medium leading-tight mt-0.5">
                    {parseBrowser(ballot.userAgent)}
                    <span className="text-muted-foreground font-normal"> on </span>
                    {parseOS(ballot.userAgent)}
                  </p>
                  {ballot.userAgent && (
                    <p
                      className="text-[10px] text-muted-foreground mt-0.5 truncate"
                      title={ballot.userAgent}
                    >
                      {ballot.userAgent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer actions (admin only) */}
        {canManage && onDelete && (
          <SheetFooter className="flex flex-col gap-2.5 border-t px-6 py-4 bg-muted/20 mt-auto">
            <Button
              variant="destructiveOutline"
              className="w-full"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onDelete(ballot), 200)
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              Delete Ballot
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
