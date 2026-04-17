import { renderEmailLayout } from "./layout"

export const OrganizationCreatedTemplate = (name: string, orgName: string, orgCode: string) => {
  const content = `
    <div class="greeting">Organization Created Successfully! 🏛️</div>
    <div class="message">
      Hi ${name}, congratulations! Your organization, <strong>${orgName}</strong>, has been successfully set up on E-Voting.
    </div>
    
    <div style="background-color: #f0f7ff; border: 1px solid #cce3ff; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">Organization Details</h3>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af;"><strong>Code:</strong> ${orgCode}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e40af;"><strong>Role:</strong> Organization Admin (Owner)</p>
    </div>

    <div class="message">
      You can now start setting up your first election, inviting candidates, and adding voters.
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/organization" class="button">
        Go to Management Dashboard
      </a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      Your organization code is used to register voting terminals via the E-Voting terminal application. Keep this code secure and do not share it with unauthorized personnel.
    </div>
  `
  return renderEmailLayout(content, "E-Voting")
}
