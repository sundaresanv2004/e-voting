"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  ShieldKeyIcon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import { PersonalInfoTab } from "./personal-info-tab"
import { SecurityTab } from "./security-tab"
import { DangerZoneTab } from "./danger-zone-tab"
import { cn } from "@/lib/utils"

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  twoFactorEnabled: boolean
  organization: { id: string; name: string; ownerId: string | null } | null
  isOrgOwner: boolean
  hasPasswordAccount: boolean
}

interface ProfileTabsProps {
  profile: ProfileData
}

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon, color: "text-primary" },
  { id: "security", label: "Security", icon: ShieldKeyIcon, color: "text-amber-500" },
  { id: "danger", label: "Danger Zone", icon: Alert01Icon, color: "text-destructive" },
]

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "profile"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`/user/profile?${params.toString()}`)
  }

  return (
    <Tabs
      orientation="vertical"
      value={currentTab}
      onValueChange={handleTabChange}
      className="gap-6 lg:gap-8"
    >
      {/* Vertical Navigation List */}
      <TabsList className="max-w-60 h-16 w-full shrink-0 self-start sticky top-6">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
          >
            <HugeiconsIcon
              icon={tab.icon}
              strokeWidth={2}
              className={cn(
                "size-4 transition-colors",
                currentTab === tab.id ? tab.color : ""
              )}
            />
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content Panels */}
      <div className="flex-1 min-w-0">
        <TabsContent value="profile" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <PersonalInfoTab profile={profile} />
        </TabsContent>
        <TabsContent value="security" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SecurityTab hasPasswordAccount={profile.hasPasswordAccount} />
        </TabsContent>
        <TabsContent value="danger" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <DangerZoneTab
            userEmail={profile.email}
            organization={profile.organization}
            isOrgOwner={profile.isOrgOwner}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
