"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignIcon, 
  UserAdd01Icon, 
  LaptopIcon,
  Copy01Icon,
  Tick02Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DashboardHeroProps {
  orgName: string
  orgCode: string
}

export function DashboardHero({ orgName, orgCode }: DashboardHeroProps) {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(orgCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-card to-muted/20 border-b p-8 pt-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Welcome, <span className="text-primary">{orgName}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl">
              Welcome to the Command Center. Manage your elections, authorize voting hardware, and oversee your organizational staff from one central hub.
            </p>
          </div>

          {/* Org Code Pill */}
          <div className="flex items-center gap-2 bg-muted/50 border rounded-2xl px-4 py-2 self-start md:self-auto hover:bg-muted transition-colors group">
            <div className="flex flex-col">
              <span className="text-[10px] items-center gap-1 flex uppercase tracking-widest font-bold text-muted-foreground">
                Organization Code
              </span>
              <code className="text-sm font-mono font-bold text-foreground">
                {orgCode}
              </code>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-background/80" 
              onClick={handleCopy}
            >
              <HugeiconsIcon 
                icon={copied ? Tick02Icon : Copy01Icon} 
                className="h-4 w-4" 
              />
            </Button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" 
            onClick={() => router.push("/admin/organization/elections?create=true")}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" strokeWidth={2.5} />
            Create Election
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full bg-background border shadow-sm transition-all active:scale-95 px-5"
            onClick={() => router.push("/admin/organization/members")}
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full bg-background border shadow-sm transition-all active:scale-95 px-5"
            onClick={() => router.push("/admin/organization/systems")}
          >
            <HugeiconsIcon icon={LaptopIcon} className="h-4 w-4 mr-2" />
            Authorize Device
          </Button>
        </div>
      </div>
    </div>
  )
}
