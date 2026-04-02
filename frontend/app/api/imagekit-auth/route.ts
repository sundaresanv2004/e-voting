import { imagekit } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const authParameters = imagekit.helper.getAuthenticationParameters();
    return NextResponse.json(authParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "ImageKit authentication failed" },
      { status: 500 }
    );
  }
};
