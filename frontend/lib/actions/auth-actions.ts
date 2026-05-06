"use server"

import { AuditStatus } from "@prisma/client"

import { db } from "@/lib/db"
import { auth, signIn } from "@/auth"
import { AuthError } from "next-auth"

import {
  generateVerificationToken,
  generatePasswordResetToken,
  getPasswordResetTokenByRawToken,
  getVerificationTokenByRawToken,
  MAX_TOKEN_ATTEMPTS,
  TokenThrottleError,
} from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from "@/lib/mail"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { ForgotPasswordSchema, ResetPasswordSchema, LoginSchema } from "@/lib/schemas/auth"
import { z } from "zod"
import { headers } from "next/headers"


export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await getPasswordResetTokenByRawToken(token)

        if (!passwordResetToken) return null

        const hasExpired = new Date(passwordResetToken.expires) < new Date()
        if (hasExpired) return null
        if (passwordResetToken.consumedAt) return null
        if (passwordResetToken.attemptCount >= MAX_TOKEN_ATTEMPTS) return null

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

        try {
            const passwordResetToken = await generatePasswordResetToken(email)
            await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)
        } catch (error) {
            if (error instanceof TokenThrottleError) {
                return { success: true }
            }
            throw error
        }

        const headerList = await headers()
        const ip = headerList.get("x-forwarded-for") || "unknown"

        await db.userAuditLog.create({
            data: {
                userId: existingUser.id,
                email,
                action: "OTP_GENERATE",
                status: AuditStatus.SUCCESS,
                reason: "Password Reset Requested",
                ipAddress: ip
            }
        })

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
        const existingToken = await getPasswordResetTokenByRawToken(token)

        if (!existingToken) {
            return { success: false, error: "Invalid token" }
        }

        if (existingToken.consumedAt) {
            return { success: false, error: "This reset link has already been used" }
        }

        const hasExpired = new Date(existingToken.expires) < new Date()

        if (hasExpired) {
            return { success: false, error: "Token has expired" }
        }

        if (existingToken.attemptCount >= MAX_TOKEN_ATTEMPTS) {
            return { success: false, error: "Too many attempts. Please request a new reset link" }
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
                data: {
                    password: hashedPassword,
                    failedLoginCount: 0,
                    lockedUntil: null,
                    lastFailedLoginAt: null,
                }
            }),
            db.passwordResetToken.delete({
                where: { id: existingToken.id }
            })
        ])

        await sendPasswordResetConfirmationEmail(existingUser.email)

        const headerList = await headers()
        const ip = headerList.get("x-forwarded-for") || "unknown"

        await db.userAuditLog.create({
            data: {
                userId: existingUser.id,
                email: existingUser.email,
                action: "PASSWORD_CHANGE",
                status: AuditStatus.SUCCESS,
                ipAddress: ip
            }
        })

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
    const existingToken = await getVerificationTokenByRawToken(email, otp)

    if (!existingToken) {
      await db.verificationToken.updateMany({
        where: {
          identifier: email,
          consumedAt: null,
          expires: { gt: new Date() },
          attemptCount: { lt: MAX_TOKEN_ATTEMPTS },
        },
        data: {
          attemptCount: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      })

      return { success: false, error: "Invalid verification code" }
    }

    if (existingToken.consumedAt) {
      return { success: false, error: "Verification code has already been used" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
      return { success: false, error: "Verification code has expired" }
    }

    if (existingToken.attemptCount >= MAX_TOKEN_ATTEMPTS) {
      return { success: false, error: "Too many attempts. Please request a new verification code" }
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
            token: existingToken.token
          }
        }
      })
    ])

    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"

    await db.userAuditLog.create({
        data: {
            email,
            action: "EMAIL_VERIFIED",
            status: AuditStatus.SUCCESS,
            ipAddress: ip
        }
    })

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

    if (!email) {
        return { success: false, error: "Unauthorized or missing email" }
    }

    try {
        const existingUser = await db.user.findUnique({
            where: { email },
            select: { emailVerified: true }
        })

        if (!existingUser || existingUser.emailVerified) {
            return { success: true }
        }

        const verificationToken = await generateVerificationToken(email)
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token)

        const headerList = await headers()
        const ip = headerList.get("x-forwarded-for") || "unknown"

        await db.userAuditLog.create({
            data: {
                email,
                action: "OTP_GENERATE",
                status: AuditStatus.SUCCESS,
                reason: "Email Verification Resend",
                ipAddress: ip
            }
        })

        return { success: true }
    } catch (error) {
        if (error instanceof TokenThrottleError) {
            return { success: false, error: error.message }
        }
        console.error("Resend error:", error)
        return { success: false, error: "Failed to resend code" }
    }
}

export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
    try {
        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            return { 
                success: false, 
                error: error.type === "CredentialsSignin" ? (error.cause?.err as any)?.code || "CredentialsSignin" : error.type 
            }
        }
        throw error
    }
}

