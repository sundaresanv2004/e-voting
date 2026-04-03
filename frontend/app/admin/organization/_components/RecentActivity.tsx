"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PlusSignIcon, 
  MapsIcon, 
  LaptopIcon, 
  UserAdd01Icon, 
  Archive01Icon,
  CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ActivityItem {
  id: string
  type: "ELECTION" | "SYSTEM" | "MEMBER"
  title: string
  description: string
  timestamp: Date
  status?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityConfig = {
  ELECTION: {
    icon: MapsIcon,
    color: "text-sky-600 bg-sky-500/10 border-sky-500/20",
    label: "Election Managed"
  },
  SYSTEM: {
    icon: LaptopIcon,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    label: "Hardware Alert"
  },
  MEMBER: {
    icon: UserAdd01Icon,
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    label: "Staff Joined"
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="border shadow-none h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No recent activity</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your organization's audit trail will appear here as you manage elections and staff.
        </p>
      </Card>
    )
  }

  return (
    <Card className="border shadow-none h-full bg-card/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Audit & Updates</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6 relative p-0">
        <div className="space-y-0">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type]
              return (
                <div 
                  key={activity.id} 
                  className={`group relative flex gap-6 px-6 py-6 transition-all hover:bg-muted/30 cursor-default ${index !== activities.length - 1 ? 'border-b border-muted/50' : ''}`}
                >
                  <div className="relative flex-none">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background border shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform ${config.color}`}>
                      <HugeiconsIcon icon={config.icon} className="h-5 w-5" strokeWidth={2} />
                    </div>
                  </div>
                  
                  <div className="flex-auto space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-bold text-foreground leading-none truncate">
                        {activity.title}
                      </h4>
                      <time className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0 h-4 border-none ${config.color}`}>
                        {config.label}
                      </Badge>
                      {activity.status && (
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0 h-4 shadow-none bg-muted-foreground/10">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
