import { renderEmailLayout, es } from './layout'

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
    <h2 style="${es.h1}">Voting terminal authorized</h2>
    <p style="${es.p}">
      Hi ${adminName}, a new voting terminal has been successfully authorized for <strong style="${es.strong}">${orgName}</strong>.
    </p>

    <div style="${es.card('#10b981')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Terminal Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Name:</strong> ${systemName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Hostname:</strong> ${hostName || 'N/A'}</p>
      <p style="${es.row}"><strong style="${es.strong}">IP Address:</strong> ${ipAddress || 'N/A'}</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Approved By:</strong> ${approvedByName}</p>
    </div>

    <p style="${es.p}">
      This terminal is now <strong style="${es.strong}">Active</strong> and ready to facilitate voting sessions. You can monitor its status and security logs from the administration dashboard.
    </p>

    <div style="${es.cta}">
      <a href="${domain}/admin/organization/systems" style="${es.button('#10b981')}">View System Status</a>
    </div>

    <p style="${es.small}">
      If you did not authorize this terminal, revoke its access immediately from the dashboard and contact your security administrator.
    </p>
  `
  return renderEmailLayout(content, `Terminal Authorized: ${systemName} — E-Voting`, 'success')
}
