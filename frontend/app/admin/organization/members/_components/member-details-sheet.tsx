"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  PencilEdit01Icon,
  Delete02Icon,
  Calendar01Icon,
  Shield01Icon,
  Mail01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  Archive01Icon,
  Clock01Icon,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Member } from "./columns"

interface MemberDetailsSheetProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (member: Member) => void
  onRemove: (member: Member) => void
  isOwner: boolean
}

function getRoleBadgeStyle(role: UserRole) {
  switch (role) {
    case UserRole.ORG_ADMIN:
      return "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-none"
    case UserRole.STAFF:
      return "bg-sky-50/50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 shadow-none"
    case UserRole.VIEWER:
      return "bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 shadow-none"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function getRoleColor(role: UserRole) {
  switch (role) {
    case UserRole.ORG_ADMIN:
      return "bg-indigo-500"
    case UserRole.STAFF:
      return "bg-sky-500"
    case UserRole.VIEWER:
      return "bg-slate-400"
    default:
      return "bg-secondary"
  }
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

export function MemberDetailsSheet({
  member,
  open,
  onOpenChange,
  onEdit,
  onRemove,
  isOwner,
}: MemberDetailsSheetProps) {
  if (!member) return null

  const joinedAgo = formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })

  return (
    <TooltipProvider delayDuration={300}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] flex flex-col p-0 bg-card hover:cursor-default overflow-x-hidden">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getRoleColor(member.role)}`} />
              <Badge variant="outline" className={getRoleBadgeStyle(member.role)}>
                {member.role.replace("_", " ")}
              </Badge>
              {isOwner && (
                <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-bold uppercase tracking-widest text-[10px] py-0.5 px-2 h-5 shadow-none">
                  Owner
                </Badge>
              )}
            </div>
            <SheetTitle className="font-semibold text-xl truncate">{member.name || "Anonymous"}</SheetTitle>
            <SheetDescription>
              User overview and organizational access permissions.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6 py-4">
            {/* Member Identity Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
              <div className="relative z-10 flex items-center gap-4">
                <Avatar className="h-14 w-14 shadow-lg border border-border/50">
                  <AvatarImage src={member.image || ""} alt={member.name || "User"} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-lg font-bold">
                    {member.name?.charAt(0) || member.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <code className="text-sm font-mono tracking-tight text-foreground truncate block min-w-0">
                          {member.email}
                        </code>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p className="break-all">{member.email}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm p-0.5 rounded-lg border shrink-0">
                      <CopyButton text={member.email} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Subtle background decoration */}
              <HugeiconsIcon
                icon={UserIcon}
                className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
                color="currentColor"
              />
            </div>

            {/* Access Scope Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-medium">Grant & Access Scope</h4>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ring-1 ring-border">
                  {member.role === UserRole.ORG_ADMIN || member.hasAllElectionsAccess ? "Unrestricted" : "Granular"}
                </span>
              </div>

              {(member.role === UserRole.ORG_ADMIN || member.hasAllElectionsAccess) ? (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 shadow-sm ring-1 ring-green-500/20">
                    <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Governance Level Access</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      Complete visibility and management rights across all current and future elections.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20">
                      <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5" color="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {member.electionAccess.length} Assigned {member.electionAccess.length === 1 ? 'Election' : 'Elections'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        Limited to specific assigned campaigns.
                      </p>
                    </div>
                  </div>

                  {member.electionAccess.length > 0 && (
                    <ScrollArea className="max-h-[180px] rounded-xl border bg-muted/5 p-3 overflow-hidden">
                      <div className="space-y-2">
                        {member.electionAccess.map((ea, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/30 transition-all group">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" color="currentColor" />
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm font-medium break-words block group-hover:text-primary transition-colors">
                                  {ea.election.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{ea.election.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            <Separator className="bg-border/60" />

            {/* Timeline Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium px-1">Membership Timeline</h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Joined Organization</p>
                    <p className="text-sm truncate leading-tight mt-0.5">
                      {format(new Date(member.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs py-0.5 shrink-0">
                    {format(new Date(member.createdAt), "h:mm a")}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shadow-sm ring-1 ring-orange-500/20">
                    <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Last Modified</p>
                    <p className="text-sm truncate leading-tight mt-0.5">
                      {format(new Date(member.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 shrink-0">
                    {joinedAgo}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Integrity Logs - Added By / Updated By */}
            {member.electionAccess.length > 0 && (() => {
              const firstAccess = member.electionAccess[member.electionAccess.length - 1]
              const latestAccess = member.electionAccess[0]
              const addedBy = firstAccess?.createdBy
              const updatedBy = latestAccess?.updatedBy

              if (!addedBy && !updatedBy) return null

              return (
                <>
                  <Separator className="bg-border/60" />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium px-1">Integrity Logs</h4>
                    <div className="grid gap-3">
                      {addedBy && (
                        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                          <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                            <AvatarImage src={addedBy.image || ""} alt={addedBy.name || "User"} className="object-cover" />
                            <AvatarFallback className="bg-green-500/5 text-green-600 text-[10px] font-bold">
                              {addedBy.name?.charAt(0) || addedBy.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs text-muted-foreground">Access Granted By</p>
                            <p className="text-sm font-medium truncate leading-tight mt-0.5">
                              {addedBy.name || "Unknown User"}
                            </p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[10px] text-muted-foreground truncate">{addedBy.email}</p>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{addedBy.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                              Added
                            </Badge>
                            <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                              {format(new Date(firstAccess.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      )}

                      {updatedBy && (
                        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                          <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                            <AvatarImage src={updatedBy.image || ""} alt={updatedBy.name || "User"} className="object-cover" />
                            <AvatarFallback className="bg-purple-500/5 text-purple-600 text-[10px] font-bold">
                              {updatedBy.name?.charAt(0) || updatedBy.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs text-muted-foreground">Last Modified By</p>
                            <p className="text-sm font-medium truncate leading-tight mt-0.5">
                              {updatedBy.name || "Unknown User"}
                            </p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[10px] text-muted-foreground truncate">{updatedBy.email}</p>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>{updatedBy.email}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                              Modified
                            </Badge>
                            <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                              {format(new Date(latestAccess.updatedAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          {!isOwner && (
            <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 bg-muted/5 lg:backdrop-blur-sm flex flex-row">
              <Button
                variant="outline"
                className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onRemove(member), 300)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4 shrink-0" color="currentColor" />
                <span className="truncate">Remove</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit(member), 300)
                }}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4 shrink-0" color="currentColor" />
                <span className="truncate">Modify Access</span>
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
