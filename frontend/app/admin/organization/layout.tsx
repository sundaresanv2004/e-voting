import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect the entire /admin/organization namespace
  if (session?.user?.role !== "ORG_ADMIN") {
    const userId = session?.user?.id;
    const organizationId = session?.user?.organizationId;

    if (!userId || !organizationId) {
      redirect("/auth/login");
    }

    const userRecord = await db.user.findUnique({
      where: { id: userId },
      select: { hasAllElectionsAccess: true },
    });

    let elections = [];

    if (userRecord?.hasAllElectionsAccess) {
      elections = await db.election.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
      });
    } else {
      const access = await db.userElectionAccess.findMany({
        where: { userId },
        include: { election: true },
        orderBy: { createdAt: "desc" },
      });
      elections = access.map((a) => a.election);
    }

    if (elections.length === 0) {
      redirect("/admin/election/no-access");
    }

    if (elections.length === 1) {
      redirect(`/admin/election/${elections[0].id}`);
    }

    if (elections.length > 1) {
      const cookieStore = await cookies();
      const lastElectionId = cookieStore.get("last_election_id")?.value;

      if (lastElectionId && elections.some((e) => e.id === lastElectionId)) {
        redirect(`/admin/election/${lastElectionId}`);
      }

      // Fallback: Latest created election among the user's access list
      const latestElection = [...elections].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];
      
      redirect(`/admin/election/${latestElection.id}`);
    }
  }

  // If ORG_ADMIN, just render the nested organization pages
  return <>{children}</>;
}
