"use client"

import * as React from "react"
import {
  PencilEdit01Icon,
  Delete02Icon,
  UserGroupIcon,
  InformationCircleIcon,
  Image01Icon,
  PassportIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CandidateColumn } from "./candidate-columns"

interface CandidateDetailsSheetProps {
  candidate: CandidateColumn | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (candidate: CandidateColumn) => void
  onDelete: (candidate: CandidateColumn) => void
}

export function CandidateDetailsSheet({
  candidate,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CandidateDetailsSheetProps) {
  if (!candidate) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[400px] flex flex-col p-0 border-l shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-2 py-0.5">
              <HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
              Candidate Profile
            </Badge>
          </div>
          <SheetTitle className="font-bold text-2xl tracking-tight">{candidate.name}</SheetTitle>
          <SheetDescription>
            Detailed configuration for this candidate.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Profile Header Image - Tall & Filled */}
          <div className="relative h-[450px] w-full bg-muted overflow-hidden group">
            {candidate.profileImage ? (
              <img
                src={candidate.profileImage}
                alt={candidate.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 bg-gradient-to-b from-muted/50 to-muted">
                <HugeiconsIcon icon={PassportIcon} className="w-16 h-16 opacity-10" />
                <p className="text-xs font-black opacity-30 uppercase tracking-tighter italic">No Profile Image</p>
              </div>
            )}
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          <div className="px-6 space-y-8 -mt-6 relative z-10">
            {/* Header Info with larger text */}
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                {candidate.name}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
                  <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
                  {candidate.role.name}
                </p>
              </div>
            </div>

            {/* Candidate Symbol Selection */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1 opacity-60 flex items-center gap-2">
                <HugeiconsIcon icon={Image01Icon} className="w-3 h-3" />
                Official Election Symbol
              </p>
              <div className="relative aspect-square rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/[0.02] overflow-hidden flex items-center justify-center group shadow-inner">
                {candidate.symbolImage ? (
                  <>
                    <img
                      src={candidate.symbolImage}
                      alt="Symbol"
                      className="h-[90%] w-[90%] object-contain transition-all duration-500 group-hover:scale-105 select-none drop-shadow-2xl"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="h-10 w-10 rounded-2xl bg-background/80 border border-primary/10 flex items-center justify-center backdrop-blur-md shadow-sm group-hover:bg-primary/5 transition-colors">
                        <HugeiconsIcon icon={Image01Icon} className="w-5 h-5 text-primary/40" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2 opacity-20">
                    <HugeiconsIcon icon={Image01Icon} className="w-12 h-12 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter italic">Symbol Not Specified</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="opacity-50" />
          </div>
        </div>

        <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 sm:flex-row flex-col bg-muted/5 lg:backdrop-blur-sm">
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={() => {
              onOpenChange(false)
              setTimeout(() => onDelete(candidate), 300)
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
            Delete Candidate
          </Button>
          <Button
            variant="outline"
            className="w-1/2 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
            onClick={() => {
              onOpenChange(false)
              setTimeout(() => onEdit(candidate), 300)
            }}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
            Edit Profile
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
