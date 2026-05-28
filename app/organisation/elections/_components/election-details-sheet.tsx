"use client"

import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ElectionDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  election: any | null // Typing later based on prisma fetch
}

export function ElectionDetailsSheet({
  open,
  onOpenChange,
  election,
}: ElectionDetailsSheetProps) {
  if (!election) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(election.code)
    toast.success("Election code copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">Active</Badge>
      case "UPCOMING":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Upcoming</Badge>
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>
      case "PAUSED":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Paused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{election.name}</SheetTitle>
          <SheetDescription>
            Detailed information about this election.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
            <div className="flex items-center mt-1">
              {getStatusBadge(election.status)}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Election Code</h4>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-2 py-1 bg-muted rounded-md text-sm font-mono">{election.code}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode}>
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Start Time</h4>
              <p className="text-sm font-medium">
                {format(new Date(election.startTime), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">End Time</h4>
              <p className="text-sm font-medium">
                {format(new Date(election.endTime), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Created</h4>
              <p className="text-xs text-muted-foreground">
                {format(new Date(election.createdAt), "MMM d, yyyy")}
                <br />
                by {election.createdBy?.name || "System"}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last Updated</h4>
              <p className="text-xs text-muted-foreground">
                {format(new Date(election.updatedAt), "MMM d, yyyy")}
                <br />
                by {election.updatedBy?.name || "System"}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
