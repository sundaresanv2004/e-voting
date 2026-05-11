import { renderEmailLayout, es } from './layout'

export const SystemExpiredTemplate = (
  adminName: string,
  systemName: string,
  hostName: string,
  ipAddress: string,
  orgName: string,
  domain: string
) => {
  const content = `
    <h2 style="${es.h1}">Terminal token expired</h2>
    <p style="${es.p}">
      Hi ${adminName}, the security token for a voting terminal in <strong style="${es.strong}">${orgName}</strong> has expired and the terminal has been automatically disconnected.
    </p>

    <div style="${es.card('#ef4444')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Terminal Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Name:</strong> ${systemName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Hostname:</strong> ${hostName || 'N/A'}</p>
      <p style="${es.row}"><strong style="${es.strong}">IP Address:</strong> ${ipAddress || 'N/A'}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
    </div>

    <div style="${es.warningBox}">
      <p style="margin:0;font-size:14px;color:#92400e;">
        &#9888;&nbsp; This terminal can no longer authorize votes or sync data until it is re-approved by an administrator.
      </p>
    </div>

    <p style="${es.p}">
      To restore service, go to the dashboard, select this terminal, and click <strong style="${es.strong}">Approve</strong> to generate a fresh security token.
    </p>

    <div style="${es.cta}">
      <a href="${domain}/admin/organization/systems" style="${es.button('#ef4444')}">Re-authorize Terminal</a>
    </div>
  `
  return renderEmailLayout(content, `Terminal Token Expired: ${systemName} — E-Voting`, 'warning')
}
