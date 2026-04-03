"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { LaptopIcon } from "@hugeicons/core-free-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface System {
  id: string
  name: string | null
  hostName: string | null
  ipAddress: string | null
  macAddress: string | null
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED"
  createdAt: Date
}

interface SystemsListProps {
  initialSystems: System[]
}

export function SystemsList({ initialSystems }: SystemsListProps) {
  const router = useRouter()
  
  // Real-time Polling: Refresh every 10 seconds to catch new hardware registration requests
  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  if (initialSystems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 shadow-sm border border-muted-foreground/10">
          <HugeiconsIcon icon={LaptopIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2 tracking-tight">No systems found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Authorized hardware will appear here once they attempt to connect using your organization access code.
        </p>
      </div>
    )
  }


  return (
    <div className="rounded-2xl border bg-card/50 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50 border-b">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">System Name</TableHead>
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">Hostname</TableHead>
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">IP Address</TableHead>
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">MAC Address</TableHead>
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">Added</TableHead>
            <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialSystems.map((system) => (
            <TableRow key={system.id} className="hover:bg-muted/30 transition-colors border-b last:border-0 group">
              <TableCell className="py-4 px-6 font-medium text-foreground">
                {system.name || "Unnamed PC"}
              </TableCell>
              <TableCell className="py-4 px-6 text-muted-foreground">
                {system.hostName || "-"}
              </TableCell>
              <TableCell className="py-4 px-6 text-muted-foreground">
                {system.ipAddress || "-"}
              </TableCell>
              <TableCell className="py-4 px-6">
                <span className="inline-block px-2 py-0.5 rounded-md bg-muted/50 border border-muted font-mono text-[10px] text-muted-foreground">
                  {system.macAddress || "UNKNOWN"}
                </span>
              </TableCell>
              <TableCell className="py-4 px-6 text-muted-foreground text-sm">
                {format(new Date(system.createdAt), "PP")}
              </TableCell>
              <TableCell className="py-4 px-6 text-right">
                {system.status === "APPROVED" && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                    Approved
                  </Badge>
                )}
                {system.status === "PENDING" && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 animate-pulse">
                    Pending
                  </Badge>
                )}
                {system.status === "REJECTED" && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                    Rejected
                  </Badge>
                )}
                {system.status === "REVOKED" && (
                  <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 border-zinc-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                    Revoked
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
