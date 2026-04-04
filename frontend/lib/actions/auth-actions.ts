"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/schemas/auth"

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findUnique({
            where: { token }
        })

        if (!passwordResetToken) return null

        const hasExpired = new Date(passwordResetToken.expires) < new Date()
        if (hasExpired) return null

        return passwordResetToken
    } catch {
        return null
    }
}

export const resetPassword = async (formData: FormData) => {
    const email = formData.get("email") as string

    const validatedFields = ForgotPasswordSchema.safeParse({ email })

    if (!validatedFields.success) {
        return { success: false, error: "Invalid email address" }
    }

    try {
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            // Return success even if user doesn't exist for security reasons (avoid email enumeration)
            return { success: true }
        }

        const passwordResetToken = await generatePasswordResetToken(email)
        await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)

        return { success: true }
    } catch (error) {
        console.error("Reset password request error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

export async function newPassword(password: string, confirmPassword: string, token: string | null) {
    if (!token) {
        return { success: false, error: "Missing token" }
    }

    const validatedFields = ResetPasswordSchema.safeParse({ password, confirmPassword })

    if (!validatedFields.success) {
        return { 
            success: false, 
            error: validatedFields.error.flatten().fieldErrors.password?.[0] || 
                   validatedFields.error.flatten().fieldErrors.confirmPassword?.[0] || 
                   "Invalid password" 
        }
    }

    try {
        const existingToken = await db.passwordResetToken.findUnique({
            where: { token }
        })

        if (!existingToken) {
            return { success: false, error: "Invalid token" }
        }

        const hasExpired = new Date(existingToken.expires) < new Date()

        if (hasExpired) {
            return { success: false, error: "Token has expired" }
        }

        const existingUser = await db.user.findUnique({
            where: { email: existingToken.email }
        })

        if (!existingUser) {
            return { success: false, error: "User not found" }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.$transaction([
            db.user.update({
                where: { id: existingUser.id },
                data: { password: hashedPassword }
            }),
            db.passwordResetToken.delete({
                where: { id: existingToken.id }
            })
        ])

        await sendPasswordResetConfirmationEmail(existingUser.email)

        return { success: true }
    } catch (error) {
        console.error("Update password error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

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
