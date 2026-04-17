import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";

export default async function ElectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ electionId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.organizationId) {
    redirect("/auth/login");
  }

  const { electionId } = await params;

  // First verify the election exists and belongs to the organization
  const election = await db.election.findUnique({
    where: {
      id: electionId,
      organizationId: session.user.organizationId,
    },
  });

  if (!election) {
    notFound();
  }

  // If user is ORG_ADMIN, they automatically have access
  if (session.user.role === "ORG_ADMIN") {
    return <>{children}</>;
  }

  // Check if they have the organization-wide all elections access flag
  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { hasAllElectionsAccess: true },
  });

  if (userRecord?.hasAllElectionsAccess) {
    return <>{children}</>;
  }

  // Check specific targeted assignment to this election
  const access = await db.userElectionAccess.findUnique({
    where: {
      userId_electionId: {
        userId: session.user.id,
        electionId: electionId,
      },
    },
  });

  if (!access) {
    // If they cannot access this election, send them back to the organization hub.
    // The organization layout will automatically catch them and bounce them 
    // to their valid selected election or the no-access page.
    redirect("/admin/organization");
  }

  return <>{children}</>;
}
