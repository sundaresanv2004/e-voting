import { PageHeader } from "@/components/shared/page-header"
import { MapsIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

export default function ElectionsPage() {
  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Elections"
        description="Manage your organization's elections and campaigns."
        icon={MapsIcon}
        actions={
          <Button asChild>
            <Link href="/organisation/elections?new=true" className="gap-2">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
              Create Election
            </Link>
          </Button>
        }
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">No elections found.</p>
      </div>
    </div>
  )
}
