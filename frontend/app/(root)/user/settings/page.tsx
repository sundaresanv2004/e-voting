"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import UserHero from "./_components/user-hero"
import { PersonalInfo } from "./_components/personal-info"
import { SecuritySettings } from "./_components/security-settings"
import { LeaveOrganization } from "./_components/leave-organization"
import { DeleteAccount } from "./_components/delete-account"
import { UserIcon, Settings01Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon, color: "text-blue-600" },
  { id: "security", label: "Security", icon: Settings01Icon, color: "text-indigo-600" },
  { id: "danger", label: "Danger Zone", icon: Alert01Icon, color: "text-amber-600" },
]

export default function AccountSettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const currentTab = searchParams.get("tab") || "profile"

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Determine icon and text for hero based on active tab
  const activeTabDetails = TABS.find((t) => t.id === currentTab) || TABS[0]

  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
      <div className="mb-8">
        <UserHero
          title="Account Settings"
          description="Manage your profile, security, and preferences."
          icon={activeTabDetails.icon}
          color={activeTabDetails.color}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center hover:cursor-pointer gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  currentTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : cn("text-muted-foreground hover:bg-muted/50 hover:text-foreground")
                )}
              >
                <HugeiconsIcon icon={tab.icon} className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col space-y-8">
            {currentTab === "profile" && <PersonalInfo />}

            {currentTab === "security" && <SecuritySettings />}

            {currentTab === "danger" && (
              <div className="space-y-6">
                <div className="space-y-6">
                  {session?.user?.organizationId && (
                    <LeaveOrganization />
                  )}

                  <DeleteAccount />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
