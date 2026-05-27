import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!session.user.organizationId) {
      return new NextResponse("Forbidden - No Organization associated", { status: 403 });
    }

    const elections = await db.election.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(elections);
  } catch (error) {
    console.error("[ELECTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
