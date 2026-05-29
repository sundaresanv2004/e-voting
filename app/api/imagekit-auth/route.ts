import { auth } from "@/lib/auth"
import { getImageKit } from "@/lib/imagekit"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export const GET = async () => {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // D2: Scope upload paths per org to prevent cross-org file overwrites
    const orgId = session.session?.activeOrganizationId ?? "shared"
    const uploadFolder = `/orgs/${orgId}/`

    const authParameters = getImageKit().helper.getAuthenticationParameters()
    return NextResponse.json({
      ...authParameters,
      folder: uploadFolder,
    })
  } catch (error) {
    console.error("ImageKit auth error:", error)
    return NextResponse.json(
      { error: "ImageKit authentication failed" },
      { status: 500 }
    )
  }
}

