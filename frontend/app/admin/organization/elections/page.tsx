import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Calendar02Icon, Clock01Icon, UserIcon, MapsIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ElectionHero from "./_components/electionHero"
import { CreateElectionTrigger } from "./_components/create-election-trigger"

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
    case "UPCOMING":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
    case "COMPLETED":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export default async function OrganizationElectionsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  // Server-side fetching strictly querying the DB directly for maximum security.
  const elections = await db.election.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true, email: true } } }
  })

  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionHero>
        <CreateElectionTrigger />
      </ElectionHero>

      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {elections.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed bg-card/50 p-8 text-center animate-in fade-in-50 duration-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 ring-8 ring-primary/5">
              <HugeiconsIcon icon={MapsIcon} strokeWidth={1.5} className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">No elections found</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              You haven't created any elections yet. Get started by creating your first election for your organization.
            </p>
            <CreateElectionTrigger size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <Card key={election.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <Badge variant="outline" className={getStatusColor(election.status)}>
                      {election.status}
                    </Badge>
                    <code className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono border whitespace-nowrap">
                      {election.code}
                    </code>
                  </div>
                  <CardTitle className="text-xl line-clamp-1" title={election.name}>{election.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-foreground">
                        <HugeiconsIcon icon={Calendar02Icon} strokeWidth={2} className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">Starts</span>
                        <span>{format(new Date(election.startTime), "MMM d, yyyy • h:mm a")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-foreground">
                        <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">Ends</span>
                        <span>{format(new Date(election.endTime), "MMM d, yyyy • h:mm a")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="w-4 h-4" />
                      <span className="truncate">Created by {election.createdBy.name || "Admin"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t pt-4">
                  <Button asChild variant="default" className="w-full relative group overflow-hidden">
                    <Link href={`/admin/election/${election.id}`}>
                      <span className="relative z-10 font-semibold">Manage Election</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
