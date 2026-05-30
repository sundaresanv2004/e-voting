"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield02Icon,
  Edit02Icon,
  Delete02Icon,
  Tag01Icon,
  UserGroupIcon,
  GridIcon,
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

// ─── UserCard (reuse pattern from election-details-sheet) ─────────────────────

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

type RoleDetails = {
  id: string
  name: string
  order: number
  electionId: string
  categories: { id: string; name: string; code: string }[]
  _count: { candidates: number }
  candidates: { id: string; name: string; profileImage: string | null }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

interface RoleDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleDetails | null
  canManage: boolean
  onEdit: (role: RoleDetails) => void
  onDelete: (role: RoleDetails) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoleDetailsSheet({
  open,
  onOpenChange,
  role,
  canManage,
  onEdit,
  onDelete,
}: RoleDetailsSheetProps) {
  if (!role) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <HugeiconsIcon icon={Shield02Icon} className="size-3" />
              Election Role
            </Badge>
          </div>
          <SheetTitle className="font-heading text-xl leading-snug break-words">
            {role.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Details for the {role.name} election role.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Order card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background border shadow-sm text-primary">
                <HugeiconsIcon icon={Tag01Icon} className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Priority Order
                </p>
                <p className="text-2xl font-bold text-foreground">#{role.order}</p>
              </div>
            </div>
            <HugeiconsIcon
              icon={Shield02Icon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-0.5">
              <HugeiconsIcon icon={GridIcon} className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Categories</h4>
            </div>
            {role.categories.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed py-8 px-4">
                <p className="text-xs text-muted-foreground">Not assigned to any category yet.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 px-0.5">
                {role.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="gap-1.5 shadow-none">
                    <HugeiconsIcon icon={GridIcon} className="size-3" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Candidates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Candidates</h4>
              </div>
              <Badge variant="secondary" className="shadow-none">
                {role._count.candidates}
              </Badge>
            </div>
            {role.candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 px-4 text-center">
                <HugeiconsIcon icon={UserGroupIcon} className="size-8 mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  No candidates registered for this role yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {role.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                  >
                    <Avatar className="size-9 border shrink-0">
                      {candidate.profileImage && (
                        <AvatarImage src={candidate.profileImage} alt={candidate.name} className="object-cover" />
                      )}
                      <AvatarFallback className="text-xs font-semibold">
                        {candidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Candidate</p>
                      <p className="text-sm font-medium truncate leading-tight mt-0.5">
                        {candidate.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Audit log */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium px-0.5">Audit Log</h4>
            <div className="grid gap-2.5">
              {role.createdBy && (
                <UserCard
                  label="Created by"
                  user={role.createdBy}
                  date={role.createdAt}
                  roleLabel="Creator"
                />
              )}
              {role.updatedBy && (
                <UserCard
                  label="Last modified by"
                  user={role.updatedBy}
                  date={role.updatedAt}
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
                  setTimeout(() => onDelete(role), 200)
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
                  setTimeout(() => onEdit(role), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit Role
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
