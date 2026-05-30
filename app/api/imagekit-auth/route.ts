import { getImageKit } from "@/lib/imagekit"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export const GET = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const uploadFolder = `/users/${session.user.id}/`

    const authParameters = getImageKit().helper.getAuthenticationParameters()
    return NextResponse.json({
      ...authParameters,
      folder: uploadFolder,
      allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 2 * 1024 * 1024,
    })
  } catch (error) {
    console.error("ImageKit auth error:", error)
    return NextResponse.json(
      { error: "ImageKit authentication failed" },
      { status: 500 }
    )
  }
}
