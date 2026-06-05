"use client"

import * as React from "react"
import Image from "next/image"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserMultipleIcon,
  Edit02Icon,
  Delete02Icon,
  Shield02Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"

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
        <p
          className="text-sm font-medium truncate leading-tight mt-0.5"
          title={user?.name ?? user?.email ?? "Unknown"}
        >
          {user?.name ?? user?.email ?? "Unknown"}
        </p>
        {user?.email && user?.name && (
          <p className="text-[10px] text-muted-foreground truncate" title={user.email}>
            {user.email}
          </p>
        )}
      </div>
      <div className="text-right flex flex-col items-end gap-1 shrink-0">
        <Badge
          variant="secondary"
          className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70"
        >
          {roleLabel}
        </Badge>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
          {format(new Date(date), "MMM d, h:mm a")}
        </p>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type CandidateDetails = {
  id: string
  name: string
  profileImage: string | null
  symbolImage: string | null
  role: { id: string; name: string; order: number }
  _count: { votes: number }
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

interface CandidateDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: CandidateDetails | null
  canManage: boolean
  onEdit: (candidate: CandidateDetails) => void
  onDelete: (candidate: CandidateDetails) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CandidateDetailsSheet({
  open,
  onOpenChange,
  candidate,
  canManage,
  onEdit,
  onDelete,
}: CandidateDetailsSheetProps) {
  if (!candidate) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <HugeiconsIcon icon={Shield02Icon} className="size-3" />
              {candidate.role.name}
            </Badge>
          </div>
          <SheetTitle className="font-heading text-3xl leading-snug break-words">
            {candidate.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Details for candidate {candidate.name}.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          
          {/* Profile & Symbol Visuals */}
          <div className="flex flex-col sm:flex-row gap-4">
            {candidate.profileImage ? (
              <div className="flex-1 rounded-2xl border bg-muted/20 p-2 overflow-hidden aspect-[3/4] flex flex-col items-center justify-center relative group">
                <div className="relative w-full h-full">
                  <Image src={candidate.profileImage} alt={candidate.name} fill className="object-cover rounded-xl" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-medium text-white uppercase tracking-wider">Profile Photo</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-dashed bg-muted/10 p-6 aspect-[3/4] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <HugeiconsIcon icon={Image01Icon} className="size-8 opacity-40" />
                <p className="text-[10px] uppercase font-semibold tracking-wider opacity-60">No Profile Image</p>
              </div>
            )}
            
            {candidate.symbolImage ? (
              <div className="flex-1 rounded-2xl border bg-muted/20 p-2 overflow-hidden aspect-[3/4] flex flex-col items-center justify-center relative group">
                <div className="w-full h-full bg-white rounded-xl p-4 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image src={candidate.symbolImage} alt="Symbol" fill className="object-contain" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-medium text-white uppercase tracking-wider">Election Symbol</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-2xl border border-dashed bg-muted/10 p-6 aspect-[3/4] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <HugeiconsIcon icon={Image01Icon} className="size-8 opacity-40" />
                <p className="text-[10px] uppercase font-semibold tracking-wider opacity-60">No Symbol</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Role assignment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Shield02Icon} className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Contesting Role</h4>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted border shadow-sm text-primary">
                <code className="text-xs font-mono font-bold">#{candidate.role.order}</code>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate leading-tight">
                  {candidate.role.name}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Audit log */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium px-0.5">Audit Log</h4>
            <div className="grid gap-2.5">
              {candidate.createdBy && (
                <UserCard
                  label="Registered by"
                  user={candidate.createdBy}
                  date={candidate.createdAt}
                  roleLabel="Creator"
                />
              )}
              {candidate.updatedBy && (
                <UserCard
                  label="Last modified by"
                  user={candidate.updatedBy}
                  date={candidate.updatedAt}
                  roleLabel="Editor"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions (admin only) */}
        {canManage && (
          <SheetFooter className="flex flex-col gap-2.5 border-t px-6 py-4 bg-muted/20">
            <div className="flex gap-2">
              <Button
                variant="destructiveOutline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete(candidate), 200)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit(candidate), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit Candidate
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
