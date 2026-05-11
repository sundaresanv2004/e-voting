import { auth } from "@/auth";
import { getImageKit } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const authParameters = getImageKit().helper.getAuthenticationParameters();
    return NextResponse.json(authParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "ImageKit authentication failed" },
      { status: 500 }
    );
  }
};
