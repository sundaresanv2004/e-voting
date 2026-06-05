"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserMinus01Icon, ArrowLeft01Icon, ArrowRight01Icon, GridIcon } from "@hugeicons/core-free-icons"

export interface NonVoter {
  id: string
  name: string
  uniqueId: string
  category: { name: string } | null
}

export function ResultsNonVoterTable({ nonVoters, isAnonymous }: { nonVoters: NonVoter[], isAnonymous: boolean }) {
  const [page, setPage] = React.useState(0)
  const pageSize = 10
  
  if (isAnonymous) {
    return (
      <Card className="p-6 gap-0 bg-muted/20 flex flex-col items-center justify-center border-dashed">
        <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center text-muted-foreground mb-4">
          <HugeiconsIcon icon={UserMinus01Icon} className="h-6 w-6" />
        </div>
        <CardTitle className="text-sm font-semibold mb-2">Non-Voters Hidden</CardTitle>
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Because this election contains anonymous ballots, the list of voters who have not yet voted is hidden to protect privacy.
        </p>
      </Card>
    )
  }

  if (nonVoters.length === 0) {
    return (
      <Card className="p-6 gap-0">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Voters Yet to Vote
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center border rounded-xl bg-emerald-500/5 border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Incredible! 100% of registered voters have cast their ballots.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(nonVoters.length / pageSize)
  const currentNonVoters = nonVoters.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <Card className="p-6 gap-0">
      <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Voters Yet to Vote
        </CardTitle>
        <Badge variant="outline" className="text-xs font-semibold tabular-nums">
          {nonVoters.length} remaining
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-xs">Voter</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs text-right">Unique ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentNonVoters.map((voter) => (
                <TableRow key={voter.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{voter.name}</span>
                  </TableCell>
                  <TableCell>
                    {voter.category ? (
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={GridIcon} className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">{voter.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">{voter.uniqueId}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, nonVoters.length)} of {nonVoters.length}
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7" 
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
