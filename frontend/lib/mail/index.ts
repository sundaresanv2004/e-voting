import { Resend } from "resend"
import { VerificationTemplate } from "./templates/verification"
import { WelcomeTemplate } from "./templates/welcome"
import { OrgInvitationTemplate } from "./templates/org-invitation"
import { ElectionAssignmentTemplate } from "./templates/election-assignment"

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

export const sendOrgInvitationEmail = async (email: string, name: string, orgName: string, role: string) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Sending organization invitation email to ${email} (${name}) for org: ${orgName}, role: ${role}`)
      return { success: true, dev: true }
    }

    const html = OrgInvitationTemplate(name, orgName, role)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "E-Voting <invite@yourdomain.com>",
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
      from: process.env.EMAIL_FROM || "E-Voting <updates@yourdomain.com>",
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
