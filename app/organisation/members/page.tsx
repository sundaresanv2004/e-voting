import { PageHeader } from "@/components/shared/page-header"
import { UserGroupIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

export default function MembersPage() {
  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Members"
        description="Manage your organization's members and their access levels."
        icon={UserGroupIcon}
        actions={
          <Button asChild>
            <Link href="/organisation/members/invite" className="gap-2">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
              Invite Members
            </Link>
          </Button>
        }
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">Member management coming soon.</p>
      </div>
    </div>
  )
}
