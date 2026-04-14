import { Resend } from "resend"
import { VerificationTemplate } from "./templates/verification"
import { WelcomeTemplate } from "./templates/welcome"
import { OrgInvitationTemplate } from "./templates/org-invitation"
import { ElectionAssignmentTemplate } from "./templates/election-assignment"
import { PasswordResetTemplate } from "./templates/password-reset"
import { PasswordResetConfirmationTemplate } from "./templates/password-reset-confirmation"
import { LoginNotificationTemplate } from "./templates/login-notification"
import { OrganizationCreatedTemplate } from "./templates/org-created"
import { OwnershipTransferredTemplate } from "./templates/ownership-transferred"
import { ElectionCreatedNotificationTemplate } from "./templates/election-created"

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const sendPasswordResetConfirmationEmail = async (email: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Password reset confirmation email for ${email}`)
      return { success: true, dev: true }
    }

    const html = PasswordResetConfirmationTemplate()

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "reset@yourdomain.com"}>`,
      to: email,
      subject: "Password Reset Successful - E-Voting",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset confirmation email:", error)
    return { success: false, error }
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`

  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Password reset link for ${email}: ${resetLink}`)
      return { success: true, dev: true }
    }

    const html = PasswordResetTemplate(resetLink)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "reset@yourdomain.com"}>`,
      to: email,
      subject: "Reset your password - E-Voting",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error }
  }
}

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Verification code for ${email}: ${token}`)
      return { success: true, dev: true }
    }

    const html = VerificationTemplate(token)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "verify@yourdomain.com"}>`,
      to: email,
      subject: "Verify your email - E-Voting",
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
      from: `E-Voting <${process.env.EMAIL_FROM || "welcome@yourdomain.com"}>`,
      to: email,
      subject: "Welcome to E-Voting!",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    return { success: false, error }
  }
}

export const sendOrgInvitationEmail = async (email: string, name: string, orgName: string, role: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Sending organization invitation email to ${email} (${name}) for org: ${orgName}, role: ${role}`)
      return { success: true, dev: true }
    }

    const html = OrgInvitationTemplate(name, orgName, role)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "invite@yourdomain.com"}>`,
      to: email,
      subject: `You've been added to ${orgName} - E-Voting`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send organization invitation email:", error)
    return { success: false, error }
  }
}

export const sendElectionAssignmentEmail = async (email: string, name: string, orgName: string, electionName: string, role: string, electionId: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Sending election assignment email to ${email} (${name}) for election: ${electionName}, role: ${role}`)
      return { success: true, dev: true }
    }

    const html = ElectionAssignmentTemplate(name, orgName, electionName, role, electionId)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "updates@yourdomain.com"}>`,
      to: email,
      subject: `New Assignment: ${electionName} - ${orgName}`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send election assignment email:", error)
    return { success: false, error }
  }
}

export const sendLoginNotificationEmail = async (email: string, name: string, ip: string, userAgent: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Login notification for ${email} from ${ip}`)
      return { success: true, dev: true }
    }

    const html = LoginNotificationTemplate(name, ip, userAgent)

    await resend.emails.send({
      from: `E-Voting Security <${process.env.EMAIL_FROM || "security@yourdomain.com"}>`,
      to: email,
      subject: "Security Alert: New Login Detected",
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send login notification email:", error)
    return { success: false, error }
  }
}

export const sendOrgCreatedEmail = async (email: string, name: string, orgName: string, orgCode: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Organization created email for ${email}: ${orgName} (${orgCode})`)
      return { success: true, dev: true }
    }

    const html = OrganizationCreatedTemplate(name, orgName, orgCode)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "onboarding@yourdomain.com"}>`,
      to: email,
      subject: `Success: ${orgName} has been created - E-Voting`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send organization created email:", error)
    return { success: false, error }
  }
}

export const sendOwnershipTransferredEmail = async (email: string, name: string, orgName: string, previousOwnerName: string, previousOwnerEmail: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Ownership transferred email for ${email} in ${orgName}`)
      return { success: true, dev: true }
    }

    const html = OwnershipTransferredTemplate(name, orgName, previousOwnerName, previousOwnerEmail)

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "onboarding@yourdomain.com"}>`,
      to: email,
      subject: `Notice: You are now the owner of ${orgName} - E-Voting`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send ownership transfer email:", error)
    return { success: false, error }
  }
}

export const sendElectionCreatedNotificationEmail = async (
  recipientEmail: string, 
  recipientName: string, 
  orgName: string, 
  electionName: string, 
  electionCode: string,
  startTime: Date,
  endTime: Date,
  creatorName: string, 
  electionId: string
) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Election created notification for ${recipientEmail}: ${electionName}`)
      return { success: true, dev: true }
    }

    const html = ElectionCreatedNotificationTemplate(
      recipientName, 
      orgName, 
      electionName, 
      electionCode,
      startTime,
      endTime,
      creatorName, 
      electionId
    )

    await resend.emails.send({
      from: `E-Voting <${process.env.EMAIL_FROM || "updates@yourdomain.com"}>`,
      to: recipientEmail,
      subject: `Notification: New Election Created - ${electionName}`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send election creation notification email:", error)
    return { success: false, error }
  }
}
