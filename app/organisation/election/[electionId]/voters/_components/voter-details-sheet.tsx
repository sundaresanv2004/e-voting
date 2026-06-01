"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  IdentificationIcon,
  GridIcon,
  Edit02Icon,
  Delete02Icon,
  Tick01Icon,
  Cancel01Icon,
  Copy01Icon,
  Tick02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { logVoterIdAccess } from "@/lib/actions/voter"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, electionId, voterId }: { text: string; electionId: string; voterId: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Voter ID copied!")
    logVoterIdAccess(electionId, voterId, "copied").catch(() => {})
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy ID">
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
    </Button>
  )
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({
  label,
  user,
  date,
  roleLabel,
}: {
  label: string
  user: { name?: string | null; email?: string | null; image?: string | null } | null
  date: Date
  roleLabel: string
}) {
  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 overflow-hidden">
      <Avatar className="size-9 shrink-0 border">
        {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
        <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-medium truncate leading-tight mt-0.5" title={user?.name ?? user?.email ?? "Unknown"}>
          {user?.name ?? user?.email ?? "Unknown"}
        </p>
        {user?.email && user?.name && (
          <p className="text-[10px] text-muted-foreground truncate" title={user.email}>{user.email}</p>
        )}
      </div>
      <div className="text-right flex flex-col items-end gap-1 shrink-0">
        <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
          {roleLabel}
        </Badge>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
          {format(new Date(date), "MMM d, h:mm a")}
        </p>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoterDetails = {
  id: string
  name: string
  uniqueId: string
  categoryId: string | null
  electionId: string
  category: { id: string; name: string; code: string } | null
  ballots: { id: string; createdAt: Date }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

interface VoterDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voter: VoterDetails | null
  canManage: boolean
  onEdit: (voter: VoterDetails) => void
  onDelete: (voter: VoterDetails) => void
  onReset: (voter: VoterDetails) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoterDetailsSheet({
  open,
  onOpenChange,
  voter,
  canManage,
  onEdit,
  onDelete,
  onReset,
}: VoterDetailsSheetProps) {
  if (!voter) return null

  const hasVoted = voter.ballots.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={
                hasVoted
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none"
              }
            >
              {hasVoted ? (
                <><HugeiconsIcon icon={Tick01Icon} className="size-3 mr-1" />Voted</>
              ) : (
                <><HugeiconsIcon icon={Cancel01Icon} className="size-3 mr-1" />Not Voted</>
              )}
            </Badge>
            {voter.category ? (
              <Badge variant="infoOutline" className="shadow-none gap-1.5">
                <HugeiconsIcon icon={GridIcon} className="size-3" />
                {voter.category.name}
              </Badge>
            ) : (
              <Badge variant="secondary" className="shadow-none">Global</Badge>
            )}
          </div>
          <SheetTitle className="font-heading text-2xl leading-snug break-words">
            {voter.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Details for voter {voter.name}.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* Unique ID Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Unique Identifier
                </p>
                <code className="text-lg font-mono tracking-wider text-foreground block truncate">
                  {voter.uniqueId}
                </code>
              </div>
              <div className="shrink-0 bg-background/60 backdrop-blur-sm border rounded-xl p-0.5">
                <CopyButton text={voter.uniqueId} electionId={voter.electionId} voterId={voter.id} />
              </div>
            </div>
            <HugeiconsIcon
              icon={IdentificationIcon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Category Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-0.5">
              <HugeiconsIcon icon={GridIcon} className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Assigned Category</h4>
            </div>
            {voter.category ? (
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted border shadow-sm">
                  <HugeiconsIcon icon={GridIcon} className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{voter.category.name}</p>
                  <code className="text-[10px] font-mono text-muted-foreground">{voter.category.code}</code>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/10 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Global voter — can participate in all categories.
                </p>
              </div>
            )}
          </div>

          {/* Voting Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-0.5">
              <HugeiconsIcon icon={UserCircleIcon} className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Voting Status</h4>
            </div>
            <div
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                hasVoted
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-muted/20 border-dashed"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  hasVoted ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                }`}
              >
                <HugeiconsIcon icon={hasVoted ? Tick01Icon : Cancel01Icon} className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{hasVoted ? "Ballot Cast" : "Awaiting Vote"}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  {hasVoted
                    ? "This voter has successfully cast their ballot."
                    : "This voter is registered but has not participated yet."}
                </p>
              </div>
              {hasVoted && voter.ballots[0]?.createdAt && (
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[10px] shadow-none bg-emerald-500/10 text-emerald-600 border-none">
                    Cast
                  </Badge>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                    {format(new Date(voter.ballots[0].createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Audit Log */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium px-0.5">Audit Log</h4>
            <div className="grid gap-2.5">
              {voter.createdBy && (
                <UserCard
                  label="Registered by"
                  user={voter.createdBy}
                  date={voter.createdAt}
                  roleLabel="Creator"
                />
              )}
              {voter.updatedBy && (
                <UserCard
                  label="Last modified by"
                  user={voter.updatedBy}
                  date={voter.updatedAt}
                  roleLabel="Editor"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions (admin only) */}
        {canManage && (
          <SheetFooter className="flex flex-col gap-2.5 border-t px-6 py-4 bg-muted/20">
            <Button
              variant="warningOutline"
              className="w-full"
              disabled={!hasVoted}
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onReset(voter), 200)
              }}
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-4" />
              Reset Vote
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructiveOutline"
                className="flex-1"
                disabled={hasVoted}
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete(voter), 200)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                {hasVoted ? "Cannot Delete" : "Delete"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit(voter), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit Voter
              </Button>
            </div>
            {hasVoted && (
              <p className="text-[11px] text-center text-muted-foreground">
                This voter has cast a ballot and cannot be deleted.
              </p>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
