import { renderEmailLayout } from "./layout"

export const OwnershipTransferredTemplate = (name: string, orgName: string, previousOwnerName: string, previousOwnerEmail: string) => {
  const content = `
    <div class="greeting">Organization Ownership Transferred! 👑</div>
    <div class="message">
      Hi ${name}, you have been appointed as the new owner of <strong>${orgName}</strong>.
    </div>
    
    <div style="background-color: #f0f7ff; border: 1px solid #cce3ff; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Transfer Details</h3>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af;"><strong>Organization:</strong> ${orgName}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e40af;"><strong>From:</strong> ${previousOwnerName} (${previousOwnerEmail})</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e40af;"><strong>New Role:</strong> Organization Owner (Admin)</p>
    </div>

    <div class="message">
      As the owner, you now have full control over the organization's settings, elections, system authorizations, and membership.
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/organization/settings" class="button">
        Manage Organization Settings
      </a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      This was an administrative action. If you believe this transfer was a mistake, please coordinate with the previous owner or your election administrator.
    </div>
  `
  return renderEmailLayout(content, "E-Voting")
}
