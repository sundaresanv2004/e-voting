import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/mail"
import { RegisterSchema } from "@/lib/schemas/auth"
import { AuditStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedFields = RegisterSchema.safeParse(body)

    if (!validatedFields.success) {
      return new NextResponse("Invalid request data", { status: 400 })
    }

    const { email, password, name } = validatedFields.data

    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return new NextResponse("An account with this email address already exists. Please log in to continue.", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token)
    await sendWelcomeEmail(email, name || "User")

    // Log the account creation
    await db.userAuditLog.create({
      data: {
        userId: user.id,
        email: user.email,
        action: "ACCOUNT_CREATE",
        status: AuditStatus.SUCCESS,
        metadata: { method: "credentials_api" }
      }
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error: any) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
