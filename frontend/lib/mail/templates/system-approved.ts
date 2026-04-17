import { renderEmailLayout } from "./layout"

export const SystemApprovedTemplate = (
  adminName: string,
  systemName: string,
  hostName: string,
  ipAddress: string,
  orgName: string,
  approvedByName: string,
  domain: string
) => {
  const content = `
    <div style="font-size: 16px; line-height: 1.6; color: #333;">
      <p>Hello ${adminName},</p>
      <p>Good news! A new voting terminal has been <strong>successfully authorized</strong> for your organization.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #065f46;">Terminal Details</h3>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${systemName}</p>
        <p style="margin: 4px 0;"><strong>Hostname:</strong> ${hostName}</p>
        <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
        <p style="margin: 4px 0;"><strong>Organization:</strong> ${orgName}</p>
        <p style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <strong>Approved By:</strong> ${approvedByName}
        </p>
      </div>

      <p>This system is now listed as <strong>Active</strong> and is ready to facilitate voting sessions. You can monitor its heartbeat and security logs from your administration dashboard.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${domain}/admin/organization/systems" 
           style="background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          View System Status
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        If you did not authorize this terminal or do not recognize this activity, please revoke the system access immediately and contact security support.
      </p>
    </div>
  `

  return renderEmailLayout(content, "Terminal Authorization Confirmed")
}
