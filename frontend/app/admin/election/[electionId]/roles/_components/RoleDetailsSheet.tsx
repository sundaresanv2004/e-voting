"use client"

import * as React from "react"
import {
  PencilEdit01Icon,
  Delete02Icon,
  ShieldKeyIcon,
  ComputerIcon,
  Tag01Icon,
  UserGroupIcon,
  LaptopIcon,
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

export type RoleDetails = {
  id: string
  name: string
  order: number
  electionId: string
  allowedSystems: { id: string; name: string | null; hostName?: string | null }[]
  _count?: {
    candidates: number
  }
  candidates?: { id: string; name: string; profileImage: string | null }[]
}

interface RoleDetailsSheetProps {
  role: RoleDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: string
  onEdit: (role: RoleDetails) => void
  onDelete: (role: RoleDetails) => void
}

export function RoleDetailsSheet({
  role,
  open,
  onOpenChange,
  userRole,
  onEdit,
  onDelete,
}: RoleDetailsSheetProps) {
  if (!role) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[400px] flex flex-col p-0 bg-card"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-2 py-0.5">
              <HugeiconsIcon icon={ShieldKeyIcon} className="w-3 h-3" />
              Election Role
            </Badge>
          </div>
          <SheetTitle className="font-bold text-2xl tracking-tight">{role.name}</SheetTitle>
          <SheetDescription>
            Detailed configuration for this contested position.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 py-6">
          {/* Role Identity Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-background shadow-sm border flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={Tag01Icon} className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Priority Order</p>
                    <p className="text-xl font-bold text-foreground block">
                      Sequence #{role.order}
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    This role appears at position <span className="font-bold">{role.order}</span> on the voting terminal.
                  </p>
                </div>
              </div>
            </div>
            {/* Subtle background decoration */}
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
              color="currentColor"
            />
          </div>

          <Separator className="border-dashed" />

          {/* Candidates Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
              <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-muted-foreground" />
              Registered Candidates
            </h4>
            <div className="grid gap-3">
              {(!role.candidates || role.candidates.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed bg-muted/5">
                  <HugeiconsIcon icon={UserGroupIcon} className="h-8 w-8 mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    No candidates have registered for this role yet.
                  </p>
                </div>
              ) : (
                role.candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                      <AvatarImage src={candidate.profileImage || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                        {candidate.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Candidate</p>
                      <p className="text-sm font-medium truncate leading-tight mt-0.5">
                        {candidate.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* Setup Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
              <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4 text-muted-foreground" />
              System Availability
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium">Access Scope</span>
                <Badge
                  variant={role.allowedSystems.length === 0 ? "secondary" : "default"}
                  className="text-[10px] font-medium px-2 py-0.5"
                >
                  {role.allowedSystems.length === 0 ? "Open Access" : "Restricted"}
                </Badge>
              </div>

              {role.allowedSystems.length === 0 ? (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 ring-1 ring-green-500/20">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Unrestricted Terminal Access</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      This role is universally available across all authorized voting systems.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {role.allowedSystems.map(system => (
                    <div
                      key={system.id}
                      className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10 group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <HugeiconsIcon icon={LaptopIcon} className="h-5 w-5" color="currentColor" />
                      </div>
                      <div className="flex flex-col flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate leading-tight mt-0.5">{system.name || "Default System"}</p>
                        {system.hostName ? (
                          <p className="text-[10px] text-muted-foreground uppercase opacity-70 tracking-widest truncate block mt-0.5">
                            {system.hostName}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground truncate block mt-0.5">
                            Restricted voting terminal
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {(userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF) && (
          <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 sm:flex-row flex-col bg-muted/5 lg:backdrop-blur-sm">
            <Button
              variant="destructive"
              className="w-1/2"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onDelete(role), 300)
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
              Delete Role
            </Button>
            <Button
              variant="outline"
              className="w-1/2 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
              onClick={() => {
                onOpenChange(false)
                setTimeout(() => onEdit(role), 300)
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
              Edit Role
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
