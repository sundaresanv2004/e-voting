import { Resend } from "resend"
import { VerificationTemplate } from "./templates/verification"
import { WelcomeTemplate } from "./templates/welcome"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Verification code for ${email}: ${token}`)
      return { success: true, dev: true }
    }

    const html = VerificationTemplate(token)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "E-Voting <verify@yourdomain.com>",
      to: email,
      subject: "Verify your email - E-Voting System",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Sending welcome email to ${email} (${name})`)
      return { success: true, dev: true }
    }

    const html = WelcomeTemplate(name)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "E-Voting <welcome@yourdomain.com>",
      to: email,
      subject: "Welcome to E-Voting System!",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error }
  }
}
