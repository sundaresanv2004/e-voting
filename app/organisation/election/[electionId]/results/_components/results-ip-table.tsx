"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { GlobalIcon, Search01Icon, Delete02Icon, MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

import { deleteBallotsByIp } from "@/lib/actions/voter"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export type IpStat = {
  ipAddress: string
  ballotCount: number
  lastActivity: Date
}

interface ResultsIpTableProps {
  data: IpStat[]
  electionId: string
  canManage: boolean
}

export function ResultsIpTable({ data, electionId, canManage }: ResultsIpTableProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [deleteTarget, setDeleteTarget] = React.useState<IpStat | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((r) => r.ipAddress.toLowerCase().includes(q))
  }, [data, search])

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!deleteTarget) return

    setIsDeleting(true)
    const res = await deleteBallotsByIp(electionId, deleteTarget.ipAddress)
    setIsDeleting(false)

    if (!res.success) {
      toast.error(res.error || "Failed to delete ballots by IP")
      return
    }

    toast.success(`Successfully deleted ${deleteTarget.ballotCount} ballot(s) from ${deleteTarget.ipAddress}`)
    setDeleteTarget(null)
    router.refresh()
  }

  return (
    <Card className="shadow-none border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <HugeiconsIcon icon={GlobalIcon} className="size-5 text-primary" />
          IP Activity
        </CardTitle>
        <CardDescription>
          Monitor voting volume from specific IP addresses to detect potential anomalies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <InputGroup className="max-w-md w-full">
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>IP Address</TableHead>
                  <TableHead>Ballot Count</TableHead>
                  <TableHead>Last Activity</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((stat) => (
                    <TableRow key={stat.ipAddress}>
                      <TableCell className="font-medium font-mono text-sm">
                        {stat.ipAddress}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{stat.ballotCount}</span>
                          <span className="text-xs text-muted-foreground">votes</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(stat.lastActivity), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="size-8 p-0">
                                <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(stat)}
                              >
                                <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                                Delete All Votes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={canManage ? 4 : 3} className="p-0">
                      <Empty className="border-none rounded-none py-8">
                        <EmptyHeader>
                          <EmptyTitle>No IP activity found</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                          <EmptyDescription>
                            {data.length > 0
                              ? "Try adjusting your search criteria."
                              : "No ballots have been submitted yet."}
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all votes from this IP?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteTarget?.ballotCount}</strong> ballot(s) originating from IP <strong>{deleteTarget?.ipAddress}</strong>?
              This will also reset the voting status for any registered voters associated with these ballots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
