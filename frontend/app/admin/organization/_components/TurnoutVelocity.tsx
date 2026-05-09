"use client"

import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Activity01Icon } from "@hugeicons/core-free-icons"

interface TurnoutVelocityProps {
  data: { time: string; ballots: number }[]
}

export function TurnoutVelocity({ data }: TurnoutVelocityProps) {
  // Compute total in the last 12h for the subtitle
  const totalLast12h = data.reduce((acc, curr) => acc + curr.ballots, 0)

  return (
    <Card className="border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-md font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Activity01Icon} className="h-5 w-5 text-emerald-500" />
            Turnout Velocity
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Recent voting activity (Last 12 Hours)
          </CardDescription>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-black tabular-nums text-emerald-500">{totalLast12h}</span>
          <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-tighter">Recent Ballots</span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-2">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBallots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                interval={2}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background px-2.5 py-1.5 shadow-xl ring-1 ring-border/50">
                        <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">
                          {payload[0].payload.time}
                        </p>
                        <p className="text-xs font-black text-foreground">
                          {payload[0].value} <span className="text-[10px] font-bold text-muted-foreground/70 ml-1">Ballots</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="ballots"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBallots)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
