import { auth } from "@/auth";
import { requireElectionAccess } from "@/lib/authz";
import { UserRole } from "@prisma/client";
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

  try {
    await requireElectionAccess(session.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
      UserRole.VIEWER,
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === "Election not found") {
      notFound();
    }
    redirect("/admin/organization");
  }

  return <>{children}</>;
}
