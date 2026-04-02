"use client"

import * as React from "react"
import {
  PencilEdit01Icon,
  Delete02Icon,
  ShieldKeyIcon,
  ComputerIcon,
  Tag01Icon,
  UserGroupIcon,
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
import { ScrollArea } from "@/components/ui/scroll-area"

export type RoleDetails = {
  id: string
  name: string
  order: number
  electionId: string
  allowedSystems: { id: string; name: string | null }[]
  _count?: {
    candidates: number
  }
}

interface RoleDetailsSheetProps {
  role: RoleDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (role: RoleDetails) => void
  onDelete: (role: RoleDetails) => void
}

export function RoleDetailsSheet({
  role,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RoleDetailsSheetProps) {
  if (!role) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] flex flex-col p-0 border-l shadow-2xl">
        <SheetHeader className="p-6 pb-2">
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
          {/* Order & Priority Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-sm ring-1 ring-primary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">
                  Priority Order
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary italic">#{role.order}</span>
                  <span className="text-xs text-muted-foreground font-medium">in sequence</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-background/80 backdrop-blur-md border shadow-inner flex items-center justify-center">
                <HugeiconsIcon icon={Tag01Icon} className="w-6 h-6 text-primary/60" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
              This role will appear at position <span className="font-bold text-foreground">{role.order}</span> on the voting terminal interface. Lower numbers appear first.
            </p>
          </div>

          {/* Setup Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 px-1">
              <HugeiconsIcon icon={ComputerIcon} className="w-4 h-4 text-muted-foreground" />
              System Restrictions
            </h4>

            <div className="rounded-2xl border bg-muted/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={role.allowedSystems.length === 0 ? "secondary" : "default"} className="text-[10px] uppercase font-black tracking-tighter">
                  {role.allowedSystems.length === 0 ? "Universal" : "Restricted"}
                </Badge>
              </div>

              {role.allowedSystems.length === 0 ? (
                <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-dashed text-muted-foreground">
                  <HugeiconsIcon icon={ShieldKeyIcon} className="w-4 h-4 opacity-50" />
                  <p className="text-xs italic">This role is available on every approved voting system.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Visible on:</p>
                  <ScrollArea className="h-24">
                    <div className="flex flex-wrap gap-2">
                      {role.allowedSystems.map(system => (
                        <Badge key={system.id} variant="outline" className="bg-background">
                          {system.name || "Default"}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Stats Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2 px-1">
              <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-muted-foreground" />
              Candidates
            </h4>
            <div className="flex items-center gap-4 rounded-2xl border p-4 hover:bg-muted/30 transition-colors cursor-default">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20">
                <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5" color="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Contesting</p>
                <p className="text-sm font-bold">{role._count?.candidates ?? 0} candidates</p>
              </div>
            </div>
          </div>
        </div>

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
      </SheetContent>
    </Sheet>
  )
}
