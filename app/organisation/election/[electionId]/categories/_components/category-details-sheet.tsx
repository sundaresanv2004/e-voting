"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  GridIcon,
  FingerPrintIcon,
  Shield02Icon,
  Edit02Icon,
  Delete02Icon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { logElectionCodeCopy } from "@/lib/actions/election"

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

function CopyButton({ text, electionId }: { text: string; electionId: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Category code copied!")
    logElectionCodeCopy(electionId).catch(() => { })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy code">
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

// ─── Component ────────────────────────────────────────────────────────────────

type CategoryDetails = {
  id: string
  name: string
  code: string
  electionId: string
  roles: { id: string; name: string; order: number }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

interface CategoryDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryDetails | null
  electionCode: string
  canManage: boolean
  onEdit: (category: CategoryDetails) => void
  onDelete: (category: CategoryDetails) => void
}

export function CategoryDetailsSheet({
  open,
  onOpenChange,
  category,
  electionCode,
  canManage,
  onEdit,
  onDelete,
}: CategoryDetailsSheetProps) {
  if (!category) return null

  const isDefault = category.code === electionCode

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            {isDefault ? (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none gap-1.5">
                <HugeiconsIcon icon={LockIcon} className="size-3" />
                Default
              </Badge>
            ) : (
              <Badge variant="infoOutline" className="shadow-none">
                Custom
              </Badge>
            )}
          </div>
          <SheetTitle className="font-heading text-2xl leading-snug break-words">
            {category.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Details for the {category.name} election category.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Category Code Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Category Code
                </p>
                <code className="text-lg font-mono tracking-wider text-foreground block truncate">
                  {category.code}
                </code>
              </div>
              <div className="shrink-0 bg-background/60 backdrop-blur-sm border rounded-xl p-0.5">
                <CopyButton text={category.code} electionId={category.electionId} />
              </div>
            </div>
            {/* Decorative watermark */}
            <HugeiconsIcon
              icon={FingerPrintIcon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Included Roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Shield02Icon} className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Included Roles</h4>
              </div>
              <Badge variant="secondary" className="shadow-none">
                {category.roles.length}
              </Badge>
            </div>
            {category.roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 px-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No roles assigned to this category.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {[...category.roles]
                  .sort((a, b) => a.order - b.order)
                  .map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <HugeiconsIcon icon={Shield02Icon} className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight mt-0.5">
                          {role.name}
                        </p>
                      </div>
                      <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md shrink-0">
                        #{role.order}
                      </code>
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
              {category.createdBy && (
                <UserCard
                  label="Created by"
                  user={category.createdBy}
                  date={category.createdAt}
                  roleLabel="Creator"
                />
              )}
              {category.updatedBy && (
                <UserCard
                  label="Last modified by"
                  user={category.updatedBy}
                  date={category.updatedAt}
                  roleLabel="Editor"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions (admin only & not default) */}
        {canManage && !isDefault && (
          <SheetFooter className="flex flex-col gap-2.5 border-t px-6 py-4 bg-muted/20">
            <div className="flex gap-2">
              <Button
                variant="destructiveOutline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete(category), 200)
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
                  setTimeout(() => onEdit(category), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit Category
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
