"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  Mail01Icon,
  Calendar01Icon,
  Clock01Icon,
  Shield01Icon,
  Edit02Icon,
  Delete02Icon,
  Archive01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/utils"

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
import { ScrollArea } from "@/components/ui/scroll-area"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any | null
  onEdit?: (member: any) => void
  onDelete?: (member: any) => void
  isAdmin?: boolean
  ownerId?: string
  currentUserId?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleDot({ role }: { role: string }) {
  const colors: Record<string, string> = {
    org_admin: "bg-indigo-500",
    staff: "bg-sky-500",
    viewer: "bg-slate-400",
  }
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[role] ?? "bg-muted-foreground"}`}
    />
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role?.toLowerCase()) {
    case "org_admin":
      return (
        <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-none">
          Org Admin
        </Badge>
      )
    case "staff":
      return (
        <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-none">
          Staff
        </Badge>
      )
    case "viewer":
      return (
        <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-none">
          Viewer
        </Badge>
      )
    default:
      return <Badge variant="secondary">{role}</Badge>
  }
}

function getRoleDescription(role: string, hasAllAccess: boolean) {
  switch (role?.toLowerCase()) {
    case "org_admin":
      return {
        title: "Full Administrator",
        description:
          "Can manage everything — elections, members, devices, and settings across the whole organization.",
      }
    case "staff":
      return {
        title: hasAllAccess ? "Staff — All Elections" : "Staff — Limited Elections",
        description: hasAllAccess
          ? "Can manage and operate all elections in the organization."
          : "Can only manage and operate the specific elections they have been assigned to.",
      }
    case "viewer":
      return {
        title: hasAllAccess ? "Viewer — All Elections" : "Viewer — Limited Elections",
        description: hasAllAccess
          ? "Can view results and data across all elections, but cannot make any changes."
          : "Can only view the specific elections they have been assigned to.",
      }
    default:
      return { title: "No Role", description: "This user has no active role in the organization." }
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      toast.success("Email copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error("Failed to copy email")
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy email">
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
    </Button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MemberDetailsSheet({
  open,
  onOpenChange,
  member,
  onEdit,
  onDelete,
  isAdmin = false,
  ownerId,
  currentUserId,
}: MemberDetailsSheetProps) {
  if (!member) return null

  const name = member.user?.name || member.displayName || "Unknown"
  const email = member.user?.email || member.email || ""
  const image = member.user?.image
  const customRole = member.user?.role || member.customRole || "viewer"
  const hasFullAccess = customRole === "org_admin" || !!member.user?.hasAllElectionsAccess
  const electionAccess: any[] = member.user?.electionAccess || []
  const isOwner = member.userId === ownerId
  const isCurrentUser = member.userId === currentUserId
  const canManage = isAdmin && !isOwner

  const roleDesc = getRoleDescription(customRole, hasFullAccess)
  const initials = name.substring(0, 2).toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">

        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <RoleDot role={customRole} />
            <RoleBadge role={customRole} />
            {isOwner && (
              <Badge
                variant="outline"
                className="bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-bold uppercase tracking-widest text-[10px] py-0 px-2 h-5 shadow-none"
              >
                Owner
              </Badge>
            )}
            {isCurrentUser && (
              <Badge
                variant="outline"
                className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-bold uppercase tracking-widest text-[10px] py-0 px-2 h-5 shadow-none"
              >
                You
              </Badge>
            )}
          </div>
          <SheetTitle className="font-heading text-xl leading-snug break-words">{name}</SheetTitle>
          <SheetDescription className="sr-only">
            Member overview and organizational access permissions.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* Identity Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center gap-4">
              <Avatar className="size-14 shadow-lg border">
                {image && <AvatarImage src={image} alt={name} className="object-cover" />}
                <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Email Address
                </p>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="text-sm font-mono tracking-tight text-foreground truncate block min-w-0">
                    {email}
                  </code>
                  <div className="shrink-0 bg-background/60 backdrop-blur-sm border rounded-xl p-0.5">
                    <CopyButton text={email} />
                  </div>
                </div>
              </div>
            </div>
            <HugeiconsIcon
              icon={Mail01Icon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Role & Permissions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Role &amp; Permissions</h4>
            <div className="flex items-start gap-3.5 rounded-2xl border bg-card px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20">
                <HugeiconsIcon icon={Shield01Icon} className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{roleDesc.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  {roleDesc.description}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Election Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h4 className="text-sm font-medium shrink-0">Election Access</h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ring-1 ring-border whitespace-nowrap">
                {hasFullAccess ? "All Elections" : "Assigned Only"}
              </span>
            </div>

            {hasFullAccess ? (
              <div className="flex items-center gap-3.5 rounded-2xl border bg-card px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <HugeiconsIcon icon={Shield01Icon} className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Access to All Elections</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Can see and manage all current and future elections automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-2.5">
                <div className="flex items-center gap-3.5 rounded-2xl border bg-card px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                    <HugeiconsIcon icon={Archive01Icon} className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {electionAccess.length} Assigned{" "}
                      {electionAccess.length === 1 ? "Election" : "Elections"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Limited to specific assigned elections only.
                    </p>
                  </div>
                </div>

                {electionAccess.length > 0 && (
                  <ScrollArea className="max-h-[180px] rounded-2xl border bg-muted/5 p-3">
                    <div className="space-y-2">
                      {electionAccess.map((ea: any, i: number) => (
                        <div
                          key={ea.electionId || i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/30 transition-all group"
                        >
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors break-words">
                              {ea.election?.name || "Unknown Election"}
                            </p>
                            {ea.election?.status && (
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
                                {ea.election.status}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Membership Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Membership Timeline</h4>
            <div className="grid gap-2.5">
              <div className="flex items-center gap-3.5 rounded-2xl border bg-card px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Joined Organization</p>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 shrink-0">
                  {format(new Date(member.createdAt), "h:mm a")}
                </Badge>
              </div>

              {member.updatedAt && (
                <div className="flex items-center gap-3.5 rounded-2xl border bg-card px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20">
                    <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Last Modified</p>
                    <p className="text-sm font-medium truncate mt-0.5">
                      {format(new Date(member.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 shrink-0">
                    {formatDistanceToNow(new Date(member.updatedAt), { addSuffix: true })}
                  </Badge>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        {canManage && (
          <SheetFooter className="flex flex-col gap-2.5 border-t px-4 py-4 bg-muted/20">
            <div className="flex gap-2 w-full">
              <Button
                variant="destructiveOutline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete?.(member), 200)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                Remove
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit?.(member), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit Access
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
