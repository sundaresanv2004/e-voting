import { getImageKit } from "@/lib/imagekit"
import { NextResponse } from "next/server"
import { AuditEntityType } from "@prisma/client"
import { ActionAuthorizationError, requireOrgActionContext } from "@/lib/auth/access"

export const dynamic = "force-dynamic"

export const GET = async () => {
  try {
    const { organizationId: orgId } = await requireOrgActionContext({
      action: "IMAGEKIT_UPLOAD_AUTH_REQUESTED",
      entityType: AuditEntityType.SECURITY,
      adminOnly: false,
    })
    const uploadFolder = `/orgs/${orgId}/`

    const authParameters = getImageKit().helper.getAuthenticationParameters()
    return NextResponse.json({
      ...authParameters,
      folder: uploadFolder,
      allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
      maxFileSize: 2 * 1024 * 1024,
    })
  } catch (error) {
    if (error instanceof ActionAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 })
    }

    console.error("ImageKit auth error:", error)
    return NextResponse.json(
      { error: "ImageKit authentication failed" },
      { status: 500 }
    )
  }
}
