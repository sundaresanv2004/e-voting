"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"

export const verifyEmail = async (otp: string, emailToken?: string) => {
  const session = await auth()
  const email = session?.user?.email || emailToken

  if (!email) {
    return { success: false, error: "Unauthorized or missing email" }
  }

  try {
    const existingToken = await db.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp
      }
    })

    if (!existingToken) {
      return { success: false, error: "Invalid verification code" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      return { success: false, error: "Verification code has expired" }
    }

    // Mark email as verified and delete the token
    await db.$transaction([
      db.user.update({
        where: { email },
        data: { emailVerified: new Date() }
      }),
      db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: otp
          }
        }
      })
    ])

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/setup/organization")

    return { success: true }
  } catch (error) {
    console.error("Verification error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export const resendVerificationCode = async (emailToken?: string) => {
    const session = await auth()
    const email = session?.user?.email || emailToken

    console.log("Resend Action - Session Email:", session?.user?.email, "Param Email:", emailToken);

    if (!email) {
        console.error("Resend Action - No email found");
        return { success: false, error: "Unauthorized or missing email" }
    }

    try {
        const verificationToken = await generateVerificationToken(email)
        console.log("Resend Action - Generated token for:", email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token)
        console.log("Resend Action - Email sent successfully");

        return { success: true }
    } catch (error) {
        console.error("Resend error:", error)
        return { success: false, error: "Failed to resend code" }
    }
}
