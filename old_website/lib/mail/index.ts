
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
import { SystemApprovedTemplate } from "./templates/system-approved"
import { SystemExpiredTemplate } from "./templates/system-expired"
import { AccountLockedTemplate } from "./templates/account-locked"
import { ElectionStartingSoonTemplate } from "./templates/election-starting-soon"
import { ElectionResultsPublishedTemplate } from "./templates/results-published"
import { MemberRemovedTemplate } from "./templates/member-removed"

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder_build_time_only")

export const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Single source of truth for the sender address
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@evoting.sundaresan.dev"
const FROM_NAME = "E-Voting"
const FROM_SECURITY = `E-Voting Security <${FROM_EMAIL}>`
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

const isDevMode = () =>
  !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder"


// ─── Auth ────────────────────────────────────────────────────────────────────

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Verification code for ${email}: ${token}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Verify your email — E-Voting",
      html: VerificationTemplate(token),
    })
    return { success: true }
  } catch (error) {
    console.error("sendVerificationEmail:", error)
    return { success: false, error }
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`
  try {
    if (isDevMode()) {
      console.log(`[DEV] Password reset link for ${email}: ${resetLink}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: "Reset your password — E-Voting",
      html: PasswordResetTemplate(resetLink),
    })
    return { success: true }
  } catch (error) {
    console.error("sendPasswordResetEmail:", error)
    return { success: false, error }
  }
}

export const sendPasswordResetConfirmationEmail = async (email: string) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Password reset confirmation for ${email}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: "Password updated successfully — E-Voting",
      html: PasswordResetConfirmationTemplate(),
    })
    return { success: true }
  } catch (error) {
    console.error("sendPasswordResetConfirmationEmail:", error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Welcome email for ${email} (${name})`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to E-Voting!",
      html: WelcomeTemplate(name),
    })
    return { success: true }
  } catch (error) {
    console.error("sendWelcomeEmail:", error)
    return { success: false, error }
  }
}

export const sendLoginNotificationEmail = async (
  email: string,
  name: string,
  ip: string,
  userAgent: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Login notification for ${email} from ${ip}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: "New sign-in detected — E-Voting",
      html: LoginNotificationTemplate(name, ip, userAgent),
    })
    return { success: true }
  } catch (error) {
    console.error("sendLoginNotificationEmail:", error)
    return { success: false, error }
  }
}

export const sendAccountLockedEmail = async (
  email: string,
  name: string,
  unlockTime?: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Account locked email for ${email}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: "Security Alert: Account Temporarily Locked — E-Voting",
      html: AccountLockedTemplate(name, unlockTime),
    })
    return { success: true }
  } catch (error) {
    console.error("sendAccountLockedEmail:", error)
    return { success: false, error }
  }
}


// ─── Organization ────────────────────────────────────────────────────────────

export const sendOrgCreatedEmail = async (
  email: string,
  name: string,
  orgName: string,
  orgCode: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Org created: ${orgName} (${orgCode}) for ${email}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${orgName} is ready — E-Voting`,
      html: OrganizationCreatedTemplate(name, orgName, orgCode),
    })
    return { success: true }
  } catch (error) {
    console.error("sendOrgCreatedEmail:", error)
    return { success: false, error }
  }
}

export const sendOrgInvitationEmail = async (
  email: string,
  name: string,
  orgName: string,
  role: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Org invitation for ${email} to ${orgName} as ${role}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You've been added to ${orgName} — E-Voting`,
      html: OrgInvitationTemplate(name, orgName, role),
    })
    return { success: true }
  } catch (error) {
    console.error("sendOrgInvitationEmail:", error)
    return { success: false, error }
  }
}

export const sendOwnershipTransferredEmail = async (
  email: string,
  name: string,
  orgName: string,
  previousOwnerName: string,
  previousOwnerEmail: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Ownership transferred to ${email} for ${orgName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You are now the owner of ${orgName} — E-Voting`,
      html: OwnershipTransferredTemplate(name, orgName, previousOwnerName, previousOwnerEmail),
    })
    return { success: true }
  } catch (error) {
    console.error("sendOwnershipTransferredEmail:", error)
    return { success: false, error }
  }
}

export const sendMemberRemovedEmail = async (
  email: string,
  name: string,
  orgName: string,
  removedByName: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Member removed: ${email} from ${orgName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your membership in ${orgName} has been removed — E-Voting`,
      html: MemberRemovedTemplate(name, orgName, removedByName),
    })
    return { success: true }
  } catch (error) {
    console.error("sendMemberRemovedEmail:", error)
    return { success: false, error }
  }
}


// ─── Elections ───────────────────────────────────────────────────────────────

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
    if (isDevMode()) {
      console.log(`[DEV] Election created notification for ${recipientEmail}: ${electionName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: recipientEmail,
      subject: `New Election Created: ${electionName} — E-Voting`,
      html: ElectionCreatedNotificationTemplate(
        recipientName, orgName, electionName, electionCode,
        startTime, endTime, creatorName, electionId
      ),
    })
    return { success: true }
  } catch (error) {
    console.error("sendElectionCreatedNotificationEmail:", error)
    return { success: false, error }
  }
}

export const sendElectionAssignmentEmail = async (
  email: string,
  name: string,
  orgName: string,
  electionName: string,
  role: string,
  electionId: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Election assignment for ${email}: ${electionName} as ${role}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Election Assignment: ${electionName} — E-Voting`,
      html: ElectionAssignmentTemplate(name, orgName, electionName, role, electionId),
    })
    return { success: true }
  } catch (error) {
    console.error("sendElectionAssignmentEmail:", error)
    return { success: false, error }
  }
}

export const sendElectionStartingSoonEmail = async (
  email: string,
  name: string,
  electionName: string,
  orgName: string,
  startTime: Date,
  electionId: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Election starting soon for ${email}: ${electionName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Reminder: ${electionName} is starting soon — E-Voting`,
      html: ElectionStartingSoonTemplate(name, electionName, orgName, startTime, electionId),
    })
    return { success: true }
  } catch (error) {
    console.error("sendElectionStartingSoonEmail:", error)
    return { success: false, error }
  }
}

export const sendElectionResultsPublishedEmail = async (
  email: string,
  name: string,
  electionName: string,
  orgName: string,
  totalVoters: number,
  totalBallots: number,
  turnout: number,
  electionId: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] Results published for ${email}: ${electionName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Results Published: ${electionName} — E-Voting`,
      html: ElectionResultsPublishedTemplate(
        name, electionName, orgName, totalVoters, totalBallots, turnout, electionId
      ),
    })
    return { success: true }
  } catch (error) {
    console.error("sendElectionResultsPublishedEmail:", error)
    return { success: false, error }
  }
}


// ─── Systems ─────────────────────────────────────────────────────────────────

export const sendSystemApprovedEmail = async (
  email: string,
  adminName: string,
  systemName: string,
  hostName: string,
  ipAddress: string,
  orgName: string,
  approvedByName: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] System approved for ${email}: ${systemName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: `Terminal Authorized: ${systemName} — E-Voting`,
      html: SystemApprovedTemplate(adminName, systemName, hostName, ipAddress, orgName, approvedByName, domain),
    })
    return { success: true }
  } catch (error) {
    console.error("sendSystemApprovedEmail:", error)
    return { success: false, error }
  }
}

export const sendSystemExpiredEmail = async (
  email: string,
  adminName: string,
  systemName: string,
  hostName: string,
  ipAddress: string,
  orgName: string
) => {
  try {
    if (isDevMode()) {
      console.log(`[DEV] System expired for ${email}: ${systemName}`)
      return { success: true, dev: true }
    }
    await resend.emails.send({
      from: FROM_SECURITY,
      to: email,
      subject: `Security Alert: Terminal Token Expired — E-Voting`,
      html: SystemExpiredTemplate(adminName, systemName, hostName, ipAddress, orgName, domain),
    })
    return { success: true }
  } catch (error) {
    console.error("sendSystemExpiredEmail:", error)
    return { success: false, error }
  }
}
