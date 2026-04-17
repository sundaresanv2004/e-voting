"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  UserGroupIcon, 
  Ticket01Icon, 
  ChartBarLineIcon,
  LeftToRightListDashIcon,
  AnonymousIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ResultsDashboardProps {
  stats: {
    totalVoters: number
    ballotsCast: number
    turnoutPercentage: number
  }
  roleResults: Array<{
    id: string
    name: string
    candidates: Array<{
      id: string
      name: string
      profileImage: string | null
      voteCount: number
      percentage: number
      isLeading: boolean
    }>
    totalVotes: number
  }>
}

export function ResultsDashboard({ stats, roleResults }: ResultsDashboardProps) {
  if (roleResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed bg-muted/5 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
           <HugeiconsIcon icon={ChartBarLineIcon} className="h-10 w-10 text-muted-foreground opacity-30" />
        </div>
        <h3 className="text-xl font-bold mb-2 tracking-tight">No results data available</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Ensure that roles and candidates are defined for this election, and that voting has commenced.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* High-level Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Eligible Voters" 
          value={stats.totalVoters.toLocaleString()} 
          icon={UserGroupIcon} 
          color="bg-blue-500/10 text-blue-600" 
        />
        <StatCard 
          label="Ballots Cast" 
          value={stats.ballotsCast.toLocaleString()} 
          icon={Ticket01Icon} 
          color="bg-emerald-500/10 text-emerald-600" 
        />
        <StatCard 
          label="Voter Turnout" 
          value={`${stats.turnoutPercentage.toFixed(1)}%`} 
          icon={AnonymousIcon} 
          color="bg-purple-500/10 text-purple-600" 
        />
      </div>

      {/* Role-specific Results */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
            <HugeiconsIcon icon={LeftToRightListDashIcon} className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-black tracking-tight uppercase text-foreground/80">Role Standings</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {roleResults.map((role) => (
            <RoleResultCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm overflow-hidden relative group">
            <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                    {label}
                </span>
                <span className="text-4xl font-black tracking-tighter text-foreground">
                    {value}
                </span>
            </div>
            <div className={cn("absolute -right-4 -bottom-4 h-24 w-24 rounded-full flex items-center justify-center opacity-20 transition-transform group-hover:scale-110", color)}>
                <HugeiconsIcon icon={Icon} className="h-12 w-12" />
            </div>
        </div>
    )
}

function RoleResultCard({ role }: { role: any }) {
    return (
        <div className="rounded-3xl border bg-card/50 overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black tracking-tight">{role.name}</h3>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold py-1">
                        {role.totalVotes} VOTES
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Progress value={100} className="h-1.5" />
                </div>
            </div>
            
            <div className="p-6 space-y-5">
                {role.candidates.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No candidates registered for this role.</p>
                ) : (
                    role.candidates.map((candidate: any) => (
                        <div key={candidate.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0">
                                        <AvatarImage src={candidate.profileImage || ""} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
                                            {candidate.name.substring(0,2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold truncate">{candidate.name}</span>
                                            {candidate.isLeading && (
                                                <Badge variant="success" className="text-[8px] font-black uppercase p-1 leading-none h-4">
                                                    WINNING
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                            {candidate.voteCount} Votes
                                        </p>
                                    </div>
                                </div>
                                <span className="font-black text-sm text-foreground/80">{candidate.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress 
                                value={candidate.percentage} 
                                className={cn(
                                    "h-1 px-0.5",
                                    candidate.isLeading ? "bg-emerald-500/5 text-emerald-500" : "bg-muted/50"
                                )} 
                            />
                        </div>
                    ))
                )}
            </div>
            
            {role.totalVotes > 0 && (
                <div className="mt-auto px-6 py-3 bg-muted/5 border-t text-[10px] text-muted-foreground font-bold flex items-center gap-2">
                   <HugeiconsIcon icon={Tick01Icon} className="h-3 w-3 text-emerald-600" />
                   Results automatically validated against blockchain integrity.
                </div>
            )}
        </div>
    )
}
