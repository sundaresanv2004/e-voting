import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default async function OrganizationElectionsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  const elections = await db.election.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true, email: true } } }
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Elections</h1>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Created By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No elections found.
                </TableCell>
              </TableRow>
            ) : (
              elections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell className="font-medium">{election.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{election.code}</code>
                  </TableCell>
                  <TableCell>
                     <Badge variant={election.status === "PUBLISHED" ? "default" : "secondary"}>
                      {election.status}
                     </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(election.startTime), "PPp")}</TableCell>
                  <TableCell>{format(new Date(election.endTime), "PPp")}</TableCell>
                  <TableCell>{election.createdBy.name || "Admin"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
