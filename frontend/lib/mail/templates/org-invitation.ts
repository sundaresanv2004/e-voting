import { renderEmailLayout } from "./layout"

export const OrgInvitationTemplate = (name: string, orgName: string, role: string) => {
  const content = `
    <div class="greeting">You've been added to ${orgName}! 🎉</div>
    <div class="message">
      Hi ${name}, you have been added to the <strong>${orgName}</strong> organization on E-Voting as a <strong>${role}</strong>.
    </div>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #111827; font-size: 16px;">What can you do?</h3>
      <ul style="margin-bottom: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
        <li>Collaborate with your team on elections</li>
        <li>Manage voting processes and results</li>
        <li>Stay updated on organization activities</li>
      </ul>
    </div>

    <div class="message">
      Log in to your dashboard to see your new organization and start contributing.
    </div>

    <div class="button-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/organization" class="button">Access Organization</a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      Welcome aboard! If you have any questions, feel free to reach out to your organization administrator.
    </div>
  `
  return renderEmailLayout(content, orgName)
}
