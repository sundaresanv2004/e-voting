"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Crown02Icon,
  ChartBarLineIcon,
  LeftToRightListDashIcon,
  Search01Icon,
  FilterIcon,
  UserGroupIcon,
  Ticket01Icon,
  AnonymousIcon,
  ShieldKeyIcon,
  GridIcon,
  ChartHistogramIcon,
  HelpCircleIcon,
  PieChartIcon,
  Cancel01Icon,
  UserMinus01Icon,
} from "@hugeicons/core-free-icons"
import { ElectionStatus, ElectionSettings, UserRole } from "@prisma/client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Area,
  AreaChart,
  ComposedChart,
  Pie,
  PieChart,
  Cell,
  Tooltip,
} from "recharts"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { ResultsStateBanner } from "./results-state-banner"
import { ResultsNonVoterTable, type NonVoter } from "./results-nonvoter-table"
import { ResultsIntegrityCard } from "./results-integrity-card"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CandidateResult {
  id: string
  name: string
  profileImage: string | null
  symbolImage: string | null
  voteCount: number
  percentage: number
  isLeading: boolean
}

export interface RoleResult {
  id: string
  name: string
  order: number
  totalVotes: number
  candidates: CandidateResult[]
}

export interface CategoryTurnout {
  id: string
  name: string
  code: string
  totalVoters: number
  ballotsCast: number
  turnoutPercentage: number
}

export interface TimelinePoint {
  time: string
  count: number
}

export interface ResultsDashboardProps {
  electionName: string
  electionStatus: ElectionStatus
  isFinalized: boolean
  finalizedAt: Date | null
  stats: {
    totalVoters: number
    ballotsCast: number
    turnoutPercentage: number
    participationRate: number
    totalRoles: number
    totalCandidates: number
  }
  roleResults: RoleResult[]
  categoryTurnout: CategoryTurnout[]
  timelineData: TimelinePoint[]
  uniqueVotersVoted: number
  nonVoters: NonVoter[]
  notaCount: number
  anonymousBallotCount: number
  ipDiversity: number
  electionSettings: Partial<ElectionSettings>
  isAnonymous: boolean
  userRole: UserRole
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string
  value: string
  icon: any
  sub?: string
}) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {sub && (
            <p className="text-xs text-muted-foreground font-medium">{sub}</p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <HugeiconsIcon icon={Icon} className="h-4.5 w-4.5" />
        </div>
      </div>
    </Card>
  )
}

// ─── Candidate Row ────────────────────────────────────────────────────────────

function CandidateRow({
  candidate,
  rank,
}: {
  candidate: CandidateResult
  rank: number
}) {
  const rankClass =
    rank === 1 && candidate.isLeading
      ? "bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
      : rank === 2
        ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20"
        : rank === 3
          ? "bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20"
          : "bg-muted text-muted-foreground"

  const barClass =
    rank === 1 && candidate.isLeading
      ? "bg-blue-600 dark:bg-blue-500"
      : rank === 2
        ? "bg-blue-500 dark:bg-blue-400"
        : rank === 3
          ? "bg-sky-500 dark:bg-sky-400"
          : "bg-muted-foreground/30"

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
        candidate.isLeading && "bg-emerald-500/[0.02]"
      )}
    >
      {/* Rank badge */}
      <div
        className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
          rankClass
        )}
      >
        {rank}
      </div>

      {/* Avatar */}
      <Avatar className="h-9 w-9 border shrink-0">
        <AvatarImage src={candidate.profileImage || ""} />
        <AvatarFallback className="text-[10px] font-bold">
          {candidate.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + progress */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{candidate.name}</span>
          {candidate.isLeading && (
            <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-[9px] font-bold uppercase py-0 px-1.5 h-4 gap-0.5 shrink-0">
              <HugeiconsIcon icon={Crown02Icon} className="w-2.5 h-2.5" />
              Leading
            </Badge>
          )}
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barClass)}
            style={{ width: `${candidate.percentage}%` }}
          />
        </div>
      </div>

      {/* Vote stats */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold tabular-nums">
          {candidate.percentage.toFixed(1)}%
        </p>
        <p className="text-[10px] text-muted-foreground font-medium tabular-nums">
          {candidate.voteCount.toLocaleString()} vote
          {candidate.voteCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}

// ─── Role Card ────────────────────────────────────────────────────────────────

function RoleCard({
  role,
  searchQuery,
}: {
  role: RoleResult
  searchQuery: string
}) {
  const filtered = searchQuery
    ? role.candidates.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : role.candidates

  const leadingCount = role.candidates.filter((c) => c.isLeading).length
  const leadingNames = role.candidates
    .filter((c) => c.isLeading)
    .map((c) => c.name)
    .join(", ")

  return (
    <Card className="overflow-hidden gap-0 p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{role.name}</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              {role.candidates.length} candidate
              {role.candidates.length !== 1 ? "s" : ""} ·{" "}
              {role.totalVotes.toLocaleString()} vote
              {role.totalVotes !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {role.totalVotes > 0 && leadingCount > 0 && (
          <Badge
            variant="outline"
            className="text-[9px] font-bold gap-1 bg-blue-600/5 text-blue-600 border-blue-600/20 dark:bg-blue-500/5 dark:text-blue-400 dark:border-blue-500/20"
          >
            <HugeiconsIcon icon={Crown02Icon} className="w-3 h-3" />
            {leadingCount > 1
              ? `Tied: ${leadingNames}`
              : `Leader: ${leadingNames}`}
          </Badge>
        )}
      </div>

      {/* Candidates */}
      <div className="divide-y divide-border/50">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {searchQuery
              ? "No candidates match your search."
              : "No candidates registered."}
          </p>
        ) : (
          filtered.map((candidate, idx) => {
            const rank =
              role.candidates.findIndex(
                (c) => c.voteCount === candidate.voteCount
              ) + 1
            return (
              <CandidateRow key={candidate.id} candidate={candidate} rank={rank} />
            )
          })
        )}
      </div>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ResultsDashboard({
  electionName,
  electionStatus,
  isFinalized,
  finalizedAt,
  stats,
  roleResults,
  categoryTurnout,
  timelineData,
  uniqueVotersVoted,
  nonVoters,
  notaCount,
  anonymousBallotCount,
  ipDiversity,
  electionSettings,
  isAnonymous,
  userRole,
}: ResultsDashboardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTab = searchParams.get("tab") || "standings"
  const [selectedRole, setSelectedRole] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const filteredRoles =
    selectedRole === "all"
      ? roleResults
      : roleResults.filter((r) => r.id === selectedRole)

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (roleResults.length === 0) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ChartHistogramIcon} />
          </EmptyMedia>
          <EmptyTitle>No results data available</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Ensure that roles and candidates are set up for this election, and
            that voting has started.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── State Banner ────────────────────────────────────────────────────── */}
      <ResultsStateBanner
        status={electionStatus}
        isFinalized={isFinalized}
        finalizedAt={finalizedAt}
        ballotsCast={stats.ballotsCast}
      />

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        {/* Tab list */}
        <div className="mb-6">
          <TabsList>
            <TabsTrigger value="standings">
              <HugeiconsIcon icon={Crown02Icon} className="w-4 h-4" />
              Standings
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <HugeiconsIcon icon={GridIcon} className="w-4 h-4" />
              Metrics
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
        </div>

        {/* Standings filter bar */}
        {currentTab === "standings" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <InputGroup className="max-w-xs w-full">
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={Search01Icon} />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <HugeiconsIcon
                  icon={FilterIcon}
                  className="w-4 h-4 text-muted-foreground mr-1"
                />
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roleResults.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ── Metrics Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="metrics" className="mt-0 outline-none">
          <div className="space-y-8">

            {/* Section: Overview */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Overview</h3>
                <p className="text-sm text-muted-foreground">High-level participation and turnout metrics for this election.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                  label="Eligible Voters"
                  value={stats.totalVoters.toLocaleString()}
                  icon={UserGroupIcon}
                  sub="Registered voters"
                />
                <StatCard
                  label="Ballots Cast"
                  value={stats.ballotsCast.toLocaleString()}
                  icon={Ticket01Icon}
                  sub="Total votes submitted"
                />
                <StatCard
                  label="Participation"
                  value={`${stats.participationRate.toFixed(1)}%`}
                  icon={ChartBarLineIcon}
                  sub={`${uniqueVotersVoted.toLocaleString()} unique voters`}
                />
                <StatCard
                  label="Abstained"
                  value={(stats.totalVoters - uniqueVotersVoted).toLocaleString()}
                  icon={UserMinus01Icon}
                  sub="Have not voted yet"
                />
                <StatCard
                  label="Positions"
                  value={stats.totalRoles.toString()}
                  icon={ShieldKeyIcon}
                  sub={`${stats.totalCandidates} candidates`}
                />
                {electionSettings.allowNota ? (
                  <StatCard
                    label="NOTA Votes"
                    value={notaCount.toLocaleString()}
                    icon={Cancel01Icon}
                    sub="None of the above"
                  />
                ) : (
                  <StatCard
                    label="Turnout (Ballots)"
                    value={`${stats.turnoutPercentage.toFixed(1)}%`}
                    icon={AnonymousIcon}
                    sub="Ballots / Total Voters"
                  />
                )}
              </div>
            </div>

            {/* Section: Ballot Integrity & Non-Voters */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Ballot Integrity &amp; Participation</h3>
                <p className="text-sm text-muted-foreground">Security metrics and a list of registered voters yet to cast their ballot.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <ResultsNonVoterTable nonVoters={nonVoters} isAnonymous={isAnonymous} />
                </div>
                <div>
                  <ResultsIntegrityCard
                    anonymousBallotCount={anonymousBallotCount}
                    namedBallotCount={stats.ballotsCast - anonymousBallotCount}
                    ipDiversity={ipDiversity}
                    isAdmin={userRole === "admin" || userRole === "org_admin" || userRole === "staff"}
                  />
                </div>
              </div>
            </div>

            {/* Removed Section: Election Settings */}

          </div>
        </TabsContent>

        {/* ── Standings Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="standings" className="mt-0 outline-none">
          {filteredRoles.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={FilterIcon} />
                </EmptyMedia>
                <EmptyTitle>No roles match the filter</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRoles.map((role) => (
                <RoleCard key={role.id} role={role} searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Analytics Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="mt-0 outline-none space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Participation Stacked Bar */}
            <Card className="p-6 gap-0">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Voter Participation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold tabular-nums">{stats.participationRate.toFixed(1)}%</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {uniqueVotersVoted.toLocaleString()} of {stats.totalVoters.toLocaleString()} voted
                  </span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${stats.participationRate}%` }}
                  />
                  <div
                    className="h-full bg-muted-foreground/20 transition-all duration-1000"
                    style={{ width: `${100 - stats.participationRate}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    Voted
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-muted-foreground/20" />
                    Abstained
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Turnout Bar Chart */}
            {categoryTurnout.length > 0 ? (
              <Card className="p-6 gap-0">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Category Turnout
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ChartContainer
                    config={{ turnout: { label: "Turnout %", color: "hsl(217 91% 60%)" } }}
                    className="h-40 w-full"
                  >
                    <BarChart
                      data={categoryTurnout.map(c => ({ name: c.name, turnout: c.turnoutPercentage }))}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={80} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} content={<ChartTooltipContent />} />
                      <Bar dataKey="turnout" fill="var(--color-turnout)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 flex items-center justify-center border-dashed">
                <p className="text-sm text-muted-foreground">No categories configured</p>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Voting Timeline with Cumulative Line */}
            {timelineData.length > 0 && (
              <Card className="p-6 gap-0">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Voting Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ChartContainer
                    config={{
                      count: { label: "Hourly Ballots", color: "hsl(217 91% 60%)" },
                      cumulative: { label: "Total Ballots", color: "hsl(217 91% 70%)" }
                    }}
                    className="h-56 w-full mt-2"
                  >
                    <ComposedChart
                      data={(() => {
                        let cum = 0;
                        return timelineData.map(d => {
                          cum += d.count;
                          return { ...d, cumulative: cum };
                        });
                      })()}
                      margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tickMargin={10} fontSize={11} className="fill-muted-foreground" />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} className="fill-muted-foreground" allowDecimals={false} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} className="fill-muted-foreground" allowDecimals={false} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} content={<ChartTooltipContent />} />
                      <Bar yAxisId="left" dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Area yAxisId="right" type="monotone" dataKey="cumulative" stroke="var(--color-cumulative)" fill="var(--color-cumulative)" fillOpacity={0.1} />
                    </ComposedChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Votes per Position Bar Chart */}
            {roleResults.length > 0 && roleResults.some(r => r.totalVotes > 0) && (
              <Card className="p-6 gap-0">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Votes per Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ChartContainer
                    config={{ votes: { label: "Votes", color: "hsl(217 91% 60%)" } }}
                    className="h-56 w-full mt-2"
                  >
                    <BarChart
                      data={roleResults.map(r => ({ name: r.name, votes: r.totalVotes }))}
                      margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                      <XAxis type="number" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tickMargin={8} fontSize={11} width={120} className="fill-muted-foreground" />
                      <Tooltip cursor={{ fill: "hsl(var(--muted)/0.5)" }} content={<ChartTooltipContent />} />
                      <Bar dataKey="votes" fill="var(--color-votes)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roleResults.map((role) => (
              <Card key={role.id} className="p-6 gap-0">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {role.name} Share
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex items-center justify-center">
                  <ChartContainer
                    config={{
                      share: { label: "Share", color: "hsl(217 91% 60%)" },
                    }}
                    className="h-64 w-full"
                  >
                    <PieChart>
                      <Pie
                        data={role.candidates.filter(c => c.voteCount > 0)}
                        dataKey="voteCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {role.candidates.filter(c => c.voteCount > 0).map((entry, index) => {
                          const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>


        {/* ── Summary Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="summary" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roleResults.map((role) => {
              const winners = role.candidates.filter((c) => c.isLeading)
              const runnerUps = role.candidates.filter((c) => !c.isLeading)
              return (
                <Card key={role.id} className="overflow-hidden gap-0 p-0">
                  {/* Role header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold">{role.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold tabular-nums">
                      {role.totalVotes.toLocaleString()} vote
                      {role.totalVotes !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Winners */}
                    {winners.length > 0 ? (
                      <div className="space-y-3">
                        {winners.map((winner) => (
                          <div
                            key={winner.id}
                            className="flex items-center gap-3"
                          >
                            <Avatar className="h-11 w-11 border-2 border-blue-600/20 dark:border-blue-500/20">
                              <AvatarImage src={winner.profileImage || ""} />
                              <AvatarFallback className="bg-emerald-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {winner.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold truncate">
                                  {winner.name}
                                </p>
                                <HugeiconsIcon
                                  icon={Crown02Icon}
                                  className="w-3.5 h-3.5 text-amber-500 shrink-0"
                                />
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                {winner.percentage.toFixed(1)}% ·{" "}
                                {winner.voteCount.toLocaleString()} votes
                              </p>
                            </div>
                            <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-[9px] font-bold uppercase shrink-0">
                              {winners.length > 1 ? "Tied" : "Leading"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No votes cast yet
                      </p>
                    )}

                    {/* Runner-ups */}
                    {runnerUps.length > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Other Candidates
                        </p>
                        {runnerUps.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border">
                                <AvatarImage src={c.profileImage || ""} />
                                <AvatarFallback className="text-[8px] font-bold">
                                  {c.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm truncate">{c.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                              {c.percentage.toFixed(1)}% · {c.voteCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ResultsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <Skeleton className="h-16 w-full rounded-xl" />
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Tabs */}
      <Skeleton className="h-10 w-64 rounded-lg" />
      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
