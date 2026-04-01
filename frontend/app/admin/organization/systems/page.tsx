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

export default async function AuthorizedSystemsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  const systems = await db.authorizedSystem.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold">Authorized Systems</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage Lab PCs and voting machines registered to this organization.</p>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No authorized systems found.
                </TableCell>
              </TableRow>
            ) : (
              systems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">{system.name || "Unnamed PC"}</TableCell>
                  <TableCell>{system.hostName || "-"}</TableCell>
                  <TableCell>{system.ipAddress || "-"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{system.macAddress || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={system.status === "APPROVED" ? "default" : system.status === "PENDING" ? "secondary" : "destructive"}>
                      {system.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(system.createdAt), "PP")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
