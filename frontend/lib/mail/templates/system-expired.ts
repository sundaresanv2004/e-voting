import { renderEmailLayout } from "./layout"

export const SystemExpiredTemplate = (
  adminName: string,
  systemName: string,
  hostName: string,
  ipAddress: string,
  orgName: string,
  domain: string
) => {
  const content = `
    <div style="font-size: 16px; line-height: 1.6; color: #333;">
      <p>Hello ${adminName},</p>
      <p>This is a security notification to inform you that the security token for <strong>${systemName}</strong> has <strong>EXPIRED</strong>.</p>
      
      <div style="background-color: #fffaf0; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #92400e;">Security Context</h3>
        <p style="margin: 4px 0;"><strong>Terminal:</strong> ${systemName}</p>
        <p style="margin: 4px 0;"><strong>Hostname:</strong> ${hostName}</p>
        <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
        <p style="margin: 4px 0;"><strong>Organization:</strong> ${orgName}</p>
      </div>

      <p>For security compliance, the terminal has been automatically disconnected. It will no longer be able to synchronize data or authorize votes until it is re-approved.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${domain}/admin/organization/systems" 
           style="background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Re-authorize Terminal
        </a>
      </div>

      <p>To restore service, please visit the dashboard, select this terminal, and click <strong>Approve</strong>. This will generate a fresh security token for the hardware.</p>
    </div>
  `

  return renderEmailLayout(content, "Security Alert: Terminal Token Expired")
}
