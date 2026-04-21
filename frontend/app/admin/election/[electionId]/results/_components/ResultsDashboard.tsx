"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Ticket01Icon,
  ChartBarLineIcon,
  AnonymousIcon,
  Tick01Icon,
  Search01Icon,
  Crown02Icon,
  ShieldKeyIcon,
  ComputerIcon,
  FilterIcon,
  LeftToRightListDashIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface CandidateData {
  id: string
  name: string
  profileImage: string | null
  symbolImage: string | null
  voteCount: number
  percentage: number
  isLeading: boolean
}

interface RoleResult {
  id: string
  name: string
  order: number
  candidates: CandidateData[]
  totalVotes: number
}

interface SystemData {
  name: string
  count: number
  percentage: number
}

interface TimelineData {
  time: string
  count: number
}

interface ResultsDashboardProps {
  electionName: string
  electionStatus: string
  stats: {
    totalVoters: number
    ballotsCast: number
    turnoutPercentage: number
    totalRoles: number
    totalCandidates: number
  }
  roleResults: RoleResult[]
  systemData: SystemData[]
  timelineData: TimelineData[]
}

export function ResultsDashboard({
  electionName,
  electionStatus,
  stats,
  roleResults,
  systemData,
  timelineData
}: ResultsDashboardProps) {
  const [selectedRole, setSelectedRole] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter roles based on selection
  const filteredRoles = selectedRole === "all"
    ? roleResults
    : roleResults.filter(r => r.id === selectedRole)

  // Filter candidates by search
  const getFilteredCandidates = (candidates: CandidateData[]) => {
    if (!searchQuery) return candidates
    return candidates.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Check if any results exist
  const hasAnyVotes = roleResults.some(r => r.totalVotes > 0)

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
    <div className="space-y-8">
      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Eligible Voters"
          value={stats.totalVoters.toLocaleString()}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatCard
          label="Ballots Cast"
          value={stats.ballotsCast.toLocaleString()}
          icon={Ticket01Icon}
          color="emerald"
        />
        <StatCard
          label="Voter Turnout"
          value={`${stats.turnoutPercentage.toFixed(1)}%`}
          icon={AnonymousIcon}
          color="purple"
        />
        <StatCard
          label="Positions"
          value={stats.totalRoles.toString()}
          icon={ShieldKeyIcon}
          color="amber"
        />
      </div>

      {/* ── Main Content with Tabs ── */}
      <Tabs defaultValue="standings" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="standings">
              <HugeiconsIcon icon={Crown02Icon} className="w-4 h-4" />
              Standings
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <HugeiconsIcon icon={ChartBarLineIcon} className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="summary">
              <HugeiconsIcon icon={LeftToRightListDashIcon} className="w-4 h-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Filters — visible in Standings tab */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <InputGroup className="max-w-[220px] w-full">
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <HugeiconsIcon icon={FilterIcon} className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Roles</SelectItem>
                {roleResults.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── STANDINGS TAB ── */}
        <TabsContent value="standings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRoles.map((role) => {
              const candidates = getFilteredCandidates(role.candidates)

              return (
                <div key={role.id} className="rounded-2xl border bg-card overflow-hidden">
                  {/* Role Header */}
                  <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight">{role.name}</h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {role.candidates.length} candidate{role.candidates.length !== 1 ? "s" : ""} · {role.totalVotes} vote{role.totalVotes !== 1 ? "s" : ""} cast
                        </p>
                      </div>
                    </div>
                    {role.totalVotes > 0 && role.candidates.length > 0 && role.candidates[0]?.isLeading && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                        <HugeiconsIcon icon={Crown02Icon} className="w-3 h-3" />
                        Leading: {role.candidates[0].name}
                      </Badge>
                    )}
                  </div>

                  {/* Candidate List */}
                  <div className="divide-y divide-border/50">
                    {candidates.length === 0 ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <p className="text-sm font-medium">
                          {searchQuery ? "No candidates match your search." : "No candidates registered for this role."}
                        </p>
                      </div>
                    ) : (
                      candidates.map((candidate, index) => (
                        <CandidateRow
                          key={candidate.id}
                          candidate={candidate}
                          rank={index + 1}
                          totalVotes={role.totalVotes}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}

            {filteredRoles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <HugeiconsIcon icon={Search01Icon} className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">No roles match the selected filter.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── ANALYTICS TAB ── */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnout Gauge */}
            <div className="rounded-2xl border bg-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Voter Turnout</h3>
                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                  {electionStatus}
                </Badge>
              </div>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-36 w-36">
                  <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="currentColor" strokeWidth="10"
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                      strokeDasharray={`${(stats.turnoutPercentage / 100) * 314.16} 314.16`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black tracking-tighter">{stats.turnoutPercentage.toFixed(1)}%</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Turnout</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-5 text-center">
                  <div>
                    <p className="text-2xl font-black tracking-tighter">{stats.ballotsCast}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Voted</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-2xl font-black tracking-tighter">{stats.totalVoters - stats.ballotsCast}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voting Source Breakdown */}
            <div className="rounded-2xl border bg-card p-6 space-y-5">
              <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Voting Source</h3>
              {systemData.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <p className="text-sm font-medium">No ballots have been submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {systemData.map((sys) => (
                    <div key={sys.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <HugeiconsIcon icon={ComputerIcon} className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-semibold truncate max-w-[180px]">{sys.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-bold">{sys.count} votes</span>
                          <Badge variant="outline" className="text-[10px] font-bold tabular-nums">
                            {sys.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${sys.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voting Timeline */}
            {timelineData.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-5 lg:col-span-2">
                <h3 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Voting Activity Timeline</h3>
                <div className="flex items-end gap-1 h-40 overflow-x-auto no-scrollbar pb-6 relative">
                  {timelineData.map((entry, i) => {
                    const maxCount = Math.max(...timelineData.map(d => d.count))
                    const heightPercent = maxCount > 0 ? (entry.count / maxCount) * 100 : 0
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-1 min-w-[40px] group"
                      >
                        <span className="text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                          {entry.count}
                        </span>
                        <div
                          className="w-full max-w-[32px] bg-emerald-500/80 rounded-t-md transition-all duration-500 ease-out group-hover:bg-emerald-400 cursor-default"
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                        <span className="text-[8px] text-muted-foreground font-medium text-center leading-tight mt-1 w-full truncate">
                          {entry.time}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── SUMMARY TAB ── */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roleResults.map(role => {
              const winner = role.candidates.find(c => c.isLeading)
              return (
                <div key={role.id} className="rounded-2xl border bg-card overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-base font-bold tracking-tight">{role.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold tabular-nums">
                      {role.totalVotes} votes
                    </Badge>
                  </div>
                  <div className="p-5 space-y-4">
                    {winner ? (
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-emerald-500/20 shadow-sm">
                          <AvatarImage src={winner.profileImage || ""} />
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-black">
                            {winner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold truncate">{winner.name}</p>
                            <HugeiconsIcon icon={Crown02Icon} className="w-4 h-4 text-amber-500 shrink-0" />
                          </div>
                          <p className="text-sm text-emerald-600 font-bold">{winner.percentage.toFixed(1)}% · {winner.voteCount} votes</p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase shrink-0">
                          Leading
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic py-2">No votes cast yet</p>
                    )}
                    {/* Runner-ups */}
                    {role.candidates.filter(c => !c.isLeading).length > 0 && (
                      <div className="border-t pt-3 space-y-2.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Other Candidates</p>
                        {role.candidates.filter(c => !c.isLeading).map(c => (
                          <div key={c.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7 border border-border">
                                <AvatarImage src={c.profileImage || ""} />
                                <AvatarFallback className="bg-muted text-muted-foreground text-[8px] font-black">
                                  {c.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate">{c.name}</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground tabular-nums">{c.percentage.toFixed(1)}% · {c.voteCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      {hasAnyVotes && (
        <div className="flex items-center justify-center gap-2 py-4 text-[10px] text-muted-foreground font-bold">
          <HugeiconsIcon icon={Tick01Icon} className="h-3 w-3 text-emerald-600" />
          Results are calculated in real-time from secure ballot data.
        </div>
      )}
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: "bg-blue-500/5", text: "text-blue-600", iconBg: "bg-blue-500/10" },
    emerald: { bg: "bg-emerald-500/5", text: "text-emerald-600", iconBg: "bg-emerald-500/10" },
    purple: { bg: "bg-purple-500/5", text: "text-purple-600", iconBg: "bg-purple-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-600", iconBg: "bg-amber-500/10" },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={cn("rounded-2xl border p-5 relative overflow-hidden group transition-colors hover:border-border/80", c.bg)}>
      <div className="relative z-10 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </span>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", c.iconBg, c.text)}>
            <HugeiconsIcon icon={Icon} className="h-4 w-4" />
          </div>
        </div>
        <span className="text-3xl font-black tracking-tighter text-foreground block">
          {value}
        </span>
      </div>
    </div>
  )
}

/* ── Candidate Row ── */
function CandidateRow({ candidate, rank, totalVotes }: { candidate: CandidateData; rank: number; totalVotes: number }) {
  const getRankStyle = (rank: number) => {
    if (rank === 1 && candidate.isLeading) return "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
    if (rank === 2) return "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20"
    if (rank === 3) return "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
    return "bg-muted text-muted-foreground"
  }

  const getBarColor = (rank: number) => {
    if (rank === 1 && candidate.isLeading) return "bg-emerald-500"
    if (rank === 2) return "bg-blue-500"
    if (rank === 3) return "bg-amber-500"
    return "bg-muted-foreground/30"
  }

  return (
    <div className={cn(
      "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20",
      candidate.isLeading && "bg-emerald-500/[0.03]"
    )}>
      {/* Rank */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
        getRankStyle(rank)
      )}>
        {rank}
      </div>

      {/* Avatar */}
      <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0">
        <AvatarImage src={candidate.profileImage || ""} />
        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">
          {candidate.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name & Vote Count */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold truncate">{candidate.name}</span>
          {candidate.isLeading && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] font-black uppercase py-0 px-1.5 h-4 leading-none">
              <HugeiconsIcon icon={Crown02Icon} className="w-2.5 h-2.5 mr-0.5" />
              Leading
            </Badge>
          )}
        </div>
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700 ease-out", getBarColor(rank))}
              style={{ width: `${candidate.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vote Stats */}
      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-sm font-black tabular-nums">{candidate.percentage.toFixed(1)}%</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider tabular-nums">
          {candidate.voteCount} vote{candidate.voteCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
