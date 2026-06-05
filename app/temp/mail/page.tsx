import React from "react"
import { render } from "@react-email/render"
import { VerificationEmail } from "@/emails/VerificationEmail"
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail"
import { PasswordResetSuccessEmail } from "@/emails/PasswordResetSuccessEmail"
import { MailPreviewClient } from "./_components/mail-preview-client"
import { LoginAlertEmail } from "@/emails/LoginAlertEmail"
import { OrgCreatedEmail } from "@/emails/OrgCreatedEmail"
import { OrgDeletedEmail } from "@/emails/OrgDeletedEmail"
import { AccountDeletedEmail } from "@/emails/AccountDeletedEmail"
import { OrgLeftEmail } from "@/emails/OrgLeftEmail"
import { ElectionCreatedEmail } from "@/emails/ElectionCreatedEmail"
import { OrgOwnershipTransferredEmail } from "@/emails/OrgOwnershipTransferredEmail"
import { OrgMemberInviteEmail } from "@/emails/OrgMemberInviteEmail"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

// ─── Template Registry ─────────────────────────────────────────────────────────
// Add new templates here to include them in the previewer
const templateComponents = [
  {
    id: "verification",
    name: "Email Verification",
    description: "Sent on signup or when re-verifying",
    tag: "Auth",
    tagColor: "#4338ca",
    element: <VerificationEmail otp="473829" userName="Sundar" />,
  },
  {
    id: "reset-password",
    name: "Reset Password",
    description: "Sent when user requests a password reset",
    tag: "Auth",
    tagColor: "#4338ca",
    element: (
      <ResetPasswordEmail
        resetPasswordLink={`${cleanBaseUrl}/auth/reset-password?token=abc123`}
        userName="Sundar"
      />
    ),
  },
  {
    id: "password-reset-success",
    name: "Password Reset Success",
    description: "Sent after password is successfully changed",
    tag: "Security",
    tagColor: "#059669",
    element: (
      <PasswordResetSuccessEmail
        loginLink={`${cleanBaseUrl}/auth/login`}
        userName="Sundar"
      />
    ),
  },
  {
    id: "login-alert",
    name: "Login Alert",
    description: "Sent on new device/IP sign-in",
    tag: "Security",
    tagColor: "#dc2626",
    element: <LoginAlertEmail userName="Sundar" loginMethod="email" browser="Chrome" os="macOS" ipAddress="192.168.1.1" location="Chennai, India" />,
  },
  {
    id: "org-created",
    name: "Organization Created",
    description: "Sent when an organization is created",
    tag: "Org",
    tagColor: "#059669",
    element: <OrgCreatedEmail userName="Sundar" orgName="Acme Corp" orgSlug="acme-corp" orgCode="ORG-123" />,
  },
  {
    id: "org-deleted",
    name: "Organization Deleted",
    description: "Sent to members when an org is deleted",
    tag: "Org",
    tagColor: "#dc2626",
    element: <OrgDeletedEmail userName="Sundar" orgName="Acme Corp" deletedBy="Admin" />,
  },
  {
    id: "account-deleted",
    name: "Account Deleted",
    description: "Sent when user deletes their account",
    tag: "Account",
    tagColor: "#52525b",
    element: <AccountDeletedEmail userName="Sundar" />,
  },
  {
    id: "org-left",
    name: "Left Organization",
    description: "Sent when user leaves an org",
    tag: "Org",
    tagColor: "#52525b",
    element: <OrgLeftEmail userName="Sundar" orgName="Acme Corp" />,
  },
  {
    id: "election-created",
    name: "Election Created",
    description: "Sent to members when an election is created",
    tag: "Election",
    tagColor: "#2563eb",
    element: <ElectionCreatedEmail userName="Sundar" orgName="Acme Corp" electionName="Board Members 2026" electionId="e-12345" electionCode="ELEC-456" startDate="Jan 1, 2026" endDate="Jan 10, 2026" createdBy="Admin" />,
  },
  {
    id: "org-ownership-transferred",
    name: "Ownership Transferred",
    description: "Sent to the new owner of an organization",
    tag: "Org",
    tagColor: "#f59e0b",
    element: <OrgOwnershipTransferredEmail userName="Sundar" orgName="Acme Corp" previousOwnerName="John Doe" />,
  },
  {
    id: "org-member-added-admin",
    name: "Org Member Added (Admin)",
    description: "Sent when added as an admin",
    tag: "Member",
    tagColor: "#8b5cf6",
    element: <OrgMemberInviteEmail userName="Sundar" orgName="Acme Corp" role="organization admin" accessType="all" addedBy="Admin" />,
  },
  {
    id: "org-member-added-staff-all",
    name: "Org Member Added (Staff - All)",
    description: "Sent when added as staff with global access",
    tag: "Member",
    tagColor: "#8b5cf6",
    element: <OrgMemberInviteEmail userName="Sundar" orgName="Acme Corp" role="staff" accessType="all" addedBy="Admin" />,
  },
  {
    id: "org-member-added-viewer-specific",
    name: "Org Member Added (Viewer - Specific)",
    description: "Sent when added as a viewer to specific elections",
    tag: "Member",
    tagColor: "#8b5cf6",
    element: <OrgMemberInviteEmail userName="Sundar" orgName="Acme Corp" role="viewer" accessType="specific" elections={["Board Members 2026", "Q3 Budget Approval"]} addedBy="Admin" />,
  },
]

export default async function MailPreviewPage() {
  // Render all templates server-side into HTML strings
  const templates = await Promise.all(
    templateComponents.map(async ({ element, ...meta }) => ({
      ...meta,
      html: await render(element),
    }))
  )

  return <MailPreviewClient templates={templates} />
}
