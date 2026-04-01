import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 })
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

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error: any) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
