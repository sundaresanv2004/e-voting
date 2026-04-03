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
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type RoleDetails = {
  id: string
  name: string
  order: number
  electionId: string
  allowedSystems: { id: string; name: string | null }[]
  _count?: {
    candidates: number
  }
  candidates?: { id: string; name: string; profileImage: string | null }[]
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
      <SheetContent 
        className="w-[400px] flex flex-col p-0 border-l shadow-2xl"
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
          {/* Order & Priority Card */}
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5 shadow-sm ring-1 ring-primary/10 transition-all hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/70">
                  Priority Order
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary italic transition-transform group-hover:scale-110 duration-500">#{role.order}</span>
                  <span className="text-[10px] uppercase font-black text-muted-foreground opacity-60">Sequence</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-background border shadow-inner flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                <HugeiconsIcon icon={Tag01Icon} className="w-6 h-6 text-primary/60" />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-medium text-muted-foreground leading-relaxed leading-relaxed">
              This role appears at position <span className="font-black text-foreground">{role.order}</span> on the voting terminal.
            </p>
          </div>

          <Separator className="opacity-50" />

          {/* Candidates Section with Accordion */}
          <div className="space-y-4">
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="candidates" className="border rounded-[2rem] bg-muted/5 overflow-hidden transition-all duration-300">
                  <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-primary/5 data-[state=open]:bg-primary/5 data-[state=open]:border-b">
                    <div className="flex items-center gap-4 w-full text-left group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20 shadow-sm transition-transform group-hover:scale-105">
                        <HugeiconsIcon icon={UserGroupIcon} className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Candidates</p>
                        <p className="text-sm font-bold truncate leading-tight mt-0.5">
                          {role.candidates?.length ?? 0} Contesting
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-background/30">
                    {(!role.candidates || role.candidates.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed text-center space-y-2 opacity-50 bg-background/50">
                         <HugeiconsIcon icon={UserGroupIcon} className="w-6 h-6 opacity-40" />
                         <p className="text-[10px] font-black uppercase tracking-tighter">No candidates registered</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 animate-in fade-in duration-500">
                        {role.candidates.map((candidate) => (
                          <div 
                             key={candidate.id} 
                             className="flex items-center gap-3 p-2.5 rounded-xl bg-background border shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-center group/item"
                          >
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover/item:border-primary transition-colors ring-1 ring-primary/5">
                              <AvatarImage src={candidate.profileImage || ""} className="object-cover" />
                              <AvatarFallback className="text-[10px] font-black uppercase bg-primary/5 text-primary">
                                {candidate.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold truncate tracking-tight text-foreground/90">{candidate.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
             </Accordion>
          </div>

          <Separator className="opacity-50" />

          {/* Setup Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1 mt-6 opacity-60 flex items-center gap-2">
              <HugeiconsIcon icon={ComputerIcon} className="w-3.5 h-3.5" />
              System Restrictions
            </h4>

            <div className="rounded-[2rem] border bg-muted/5 p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-[11px] font-bold text-foreground uppercase tracking-widest pl-1 opacity-70">Availability</p>
                <Badge 
                  variant={role.allowedSystems.length === 0 ? "secondary" : "default"} 
                  className={cn(
                    "text-[10px] font-black tracking-tighter uppercase px-2.5 py-0.5",
                    role.allowedSystems.length === 0 ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-500/20" : "shadow-sm border-none"
                  )}
                >
                  {role.allowedSystems.length === 0 ? "Open Access" : "Restricted"}
                </Badge>
              </div>

              {role.allowedSystems.length === 0 ? (
                <div className="flex items-center gap-3 bg-background p-3.5 rounded-2xl border text-muted-foreground shadow-sm">
                  <div className="p-1.5 bg-green-500/10 rounded-lg shrink-0">
                    <HugeiconsIcon icon={ShieldKeyIcon} className="w-4 h-4 text-green-600" strokeWidth={2} />
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">This role is universally available across all voting systems.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {role.allowedSystems.map(system => (
                    <Badge 
                      key={system.id} 
                      variant="outline" 
                      className="bg-background/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold border-primary/20 rounded-xl hover:bg-primary/5 transition-colors shadow-sm"
                    >
                      {system.name || "Default"}
                    </Badge>
                  ))}
                </div>
              )}
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
