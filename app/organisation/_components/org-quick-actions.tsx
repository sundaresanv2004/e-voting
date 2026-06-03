import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Settings02Icon,
  ShieldKeyIcon,
  MapsIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

interface OrgQuickActionsProps {
  isOwner: boolean
}

export function OrgQuickActions({ isOwner }: OrgQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>Common tasks at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start gap-3" asChild>
          <Link href="/organisation/elections?new=true">
            <div className="w-7 h-7 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={MapsIcon} className="h-3.5 w-3.5 text-violet-500" strokeWidth={2} />
            </div>
            <span className="text-sm">Create Election</span>
          </Link>
        </Button>

        <Button variant="outline" className="w-full justify-start gap-3" asChild>
          <Link href="/organisation/members?new=true">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={UserGroupIcon} className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
            </div>
            <span className="text-sm">Add Member</span>
          </Link>
        </Button>

        {isOwner && (
          <Button variant="outline" className="w-full justify-start gap-3" asChild>
            <Link href="/organisation/settings">
              <div className="w-7 h-7 rounded-md bg-slate-500/10 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Settings02Icon} className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
              </div>
              <span className="text-sm">Organization Settings</span>
            </Link>
          </Button>
        )}

        <Button variant="outline" className="w-full justify-start gap-3" asChild>
          <Link href="/organisation/audit-logs">
            <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={ShieldKeyIcon} className="h-3.5 w-3.5 text-rose-500" strokeWidth={2} />
            </div>
            <span className="text-sm">View Audit Logs</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
