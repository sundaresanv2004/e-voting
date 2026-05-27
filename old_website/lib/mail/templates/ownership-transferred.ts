import { renderEmailLayout, es } from './layout'

export const OwnershipTransferredTemplate = (
  name: string,
  orgName: string,
  previousOwnerName: string,
  previousOwnerEmail: string
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">You are now the owner of ${orgName}</h2>
    <p style="${es.p}">
      Hi ${name}, ownership of <strong style="${es.strong}">${orgName}</strong> has been transferred to you. You now have full administrative control over the organization.
    </p>

    <div style="${es.card('#ef4444')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Transfer Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Transferred From:</strong> ${previousOwnerName} (${previousOwnerEmail})</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Your New Role:</strong> Organization Owner (Admin)</p>
    </div>

    <p style="${es.p}">
      As owner, you can manage all elections, configure organization settings, authorize voting terminals, and control membership — including transferring ownership again if needed.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/organization/settings" style="${es.button('#ef4444')}">Manage Organization Settings</a>
    </div>

    <p style="${es.small}">
      If you believe this transfer was made in error, please coordinate with the previous owner or contact support immediately.
    </p>
  `
  return renderEmailLayout(content, `Ownership Transfer: ${orgName} — E-Voting`, 'warning')
}
