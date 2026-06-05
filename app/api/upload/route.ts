import { getImageKit } from "@/lib/imagekit"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { logAdminAction } from "@/lib/auth/audit"
import { AuditEntityType, AuditStatus } from "@prisma/client"

export async function POST(req: Request) {
  let session = null
  let folder: string | null = null
  try {
    session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    folder = formData.get("folder") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the File to a Buffer and then to base64 Data URI for the ImageKit Node SDK
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64File = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64File}`

    // Ensure the folder path is correct
    const uploadFolder = folder || `/users/${session.user.id}/`

    // Upload using ImageKit NodeJS SDK
    const uploadResponse = await getImageKit().files.upload({
      file: dataUri,
      fileName: file.name.replace(/[^a-zA-Z0-9.-]/g, "_") || `upload-${Date.now()}`,
      folder: uploadFolder,
    })

    await logAdminAction({
      adminId: session.user.id,
      organizationId: session.session.activeOrganizationId,
      action: "FILE_UPLOADED",
      entityType: AuditEntityType.SECURITY,
      status: AuditStatus.SUCCESS,
      description: `Uploaded file: ${file.name} to folder ${uploadFolder}`,
      metadata: { fileName: file.name, folder: uploadFolder, url: uploadResponse.url }
    })

    return NextResponse.json({ url: uploadResponse.url })
  } catch (error: any) {
    console.error("Server upload error:", error)
    try {
      await logAdminAction({
        adminId: session?.user?.id || null,
        organizationId: session?.session?.activeOrganizationId || null,
        action: "FILE_UPLOADED",
        entityType: AuditEntityType.SECURITY,
        status: AuditStatus.FAILURE,
        description: `File upload failed: ${error.message || String(error)}`,
        metadata: { folder }
      })
    } catch (e) {}
    return NextResponse.json(
      { error: error.message || "Failed to upload file to server" },
      { status: 500 }
    )
  }
}
