import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tag01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

interface Category {
  id: string
  name: string
  code: string
  _count: {
    voters: number
  }
}

interface ElectionCategoriesSnapshotProps {
  electionId: string
  categories: Category[]
  totalVoters: number
}

export function ElectionCategoriesSnapshot({
  electionId,
  categories,
  totalVoters,
}: ElectionCategoriesSnapshotProps) {
  if (categories.length === 0) return null

  const categoryColors = [
    { bar: "bg-teal-500", dot: "bg-teal-500" },
    { bar: "bg-cyan-500", dot: "bg-cyan-500" },
    { bar: "bg-violet-500", dot: "bg-violet-500" },
    { bar: "bg-fuchsia-500", dot: "bg-fuchsia-500" },
    { bar: "bg-rose-500", dot: "bg-rose-500" },
  ]

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={Tag01Icon} className="h-5 w-5 text-teal-500" />
            Categories
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {categories.length} voter {categories.length === 1 ? "group" : "groups"}
          </CardDescription>
        </div>
        <Link href={`/organisation/election/${electionId}/categories`}>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            Manage
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pb-6 pt-4">
        <div className="space-y-3">
          {categories.slice(0, 5).map((cat, idx) => {
            const pct =
              totalVoters > 0 ? (cat._count.voters / totalVoters) * 100 : 0
            const { bar, dot } = categoryColors[idx % categoryColors.length]

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className="max-w-[150px] truncate text-muted-foreground">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {cat._count.voters} voter{cat._count.voters !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar}`}
                    style={{
                      width: `${Math.max(pct, cat._count.voters > 0 ? 4 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
          {categories.length > 5 && (
            <div className="pt-1 text-center">
              <span className="text-[10px] font-bold text-muted-foreground">
                +{categories.length - 5} more{" "}
                {categories.length - 5 === 1 ? "category" : "categories"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
