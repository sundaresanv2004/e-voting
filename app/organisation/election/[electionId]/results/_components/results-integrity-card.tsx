import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon, AnonymousIcon, ContactIcon, Globe02Icon } from "@hugeicons/core-free-icons"

export function ResultsIntegrityCard({
  anonymousBallotCount,
  namedBallotCount,
  ipDiversity,
  isAdmin,
}: {
  anonymousBallotCount: number
  namedBallotCount: number
  ipDiversity: number
  isAdmin: boolean
}) {
  return (
    <Card className="overflow-hidden gap-0 p-0 h-full">
      <CardHeader className="p-4 border-b bg-muted/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={ShieldKeyIcon} className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Ballot Integrity
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={AnonymousIcon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Anonymous Ballots</p>
                <p className="text-xs text-muted-foreground">Identity protected</p>
              </div>
            </div>
            <span className="text-2xl font-bold tabular-nums">{anonymousBallotCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <HugeiconsIcon icon={ContactIcon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Named Ballots</p>
                <p className="text-xs text-muted-foreground">Tied to voter ID</p>
              </div>
            </div>
            <span className="text-2xl font-bold tabular-nums">{namedBallotCount}</span>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <HugeiconsIcon icon={Globe02Icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">IP Diversity</p>
                  <p className="text-xs text-muted-foreground">Unique voting locations</p>
                </div>
              </div>
              <span className="text-2xl font-bold tabular-nums">{ipDiversity}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
