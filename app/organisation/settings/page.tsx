import { PageHeader } from "@/components/shared/page-header"
import { Settings02Icon } from "@hugeicons/core-free-icons"

export default function SettingsPage() {
  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Settings"
        description="Manage your organization's configuration and preferences."
        icon={Settings02Icon}
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">Settings configuration coming soon.</p>
      </div>
    </div>
  )
}
