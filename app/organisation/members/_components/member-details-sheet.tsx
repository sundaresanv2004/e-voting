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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MemberDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any | null // Type properly based on prisma / better auth
}

export function MemberDetailsSheet({
  open,
  onOpenChange,
  member,
}: MemberDetailsSheetProps) {
  if (!member) return null

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(member.user.email)
    toast.success("Email copied to clipboard")
  }

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "org_admin":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20">Org Admin</Badge>
      case "staff":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20">Staff</Badge>
      case "viewer":
        return <Badge className="bg-slate-500/15 text-slate-600 border-slate-500/20">Viewer</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const name = member.user.name || "Unknown"
  const email = member.user.email
  const fallback = name.substring(0, 2).toUpperCase()
  const customRole = member.user.role || "viewer"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6 flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            {member.user.image && (
              <AvatarImage src={member.user.image} alt={name} />
            )}
            <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <SheetTitle className="text-xl m-0 leading-none">{name}</SheetTitle>
            <SheetDescription className="m-0">
              Active organization member
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Role</h4>
            <div className="flex items-center mt-1">
              {getRoleBadge(customRole)}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium">{email}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyEmail}>
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Election Access</h4>
            <div className="flex items-center gap-2 mt-1">
              {member.user.hasAllElectionsAccess ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Full Access</Badge>
              ) : (
                <Badge variant="outline">
                  {member.user.electionAccess?.length || 0} Specific Election(s)
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Joined At</h4>
              <p className="text-sm">
                {format(new Date(member.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
