"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PersonalInfo } from "./_components/personal-info"
import { SecuritySettings } from "./_components/security-settings"
import { DangerZone } from "./_components/danger-zone"
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

  const currentTab = searchParams.get("tab") || "profile"

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Determine icon and text for hero based on active tab
  const activeTabDetails = TABS.find((t) => t.id === currentTab) || TABS[0]

  return (
    <div className="flex-1 w-full flex flex-col pt-6 pb-20 px-4 md:px-8">
      {/* Header Section */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Account Management
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your personal information, security preferences, and account status.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-4 mb-3">
              Settings Menu
            </p>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center hover:cursor-pointer gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap group",
                    currentTab === tab.id
                      ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    currentTab === tab.id ? "bg-primary/20" : "bg-muted group-hover:bg-background"
                  )}>
                    <HugeiconsIcon icon={tab.icon} className="h-4 w-4 shrink-0" />
                  </div>
                  {tab.label}
                  {currentTab === tab.id && (
                    <div className="ml-auto w-1 h-4 bg-primary rounded-full hidden lg:block animate-in fade-in zoom-in duration-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-1 md:p-6 lg:p-8 shadow-sm">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {currentTab === "profile" && <PersonalInfo />}
              {currentTab === "security" && <SecuritySettings />}
              {currentTab === "danger" && <DangerZone />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
