import { renderEmailLayout, es } from './layout'

export const MemberRemovedTemplate = (name: string, orgName: string, removedByName: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">You've been removed from ${orgName}</h2>
    <p style="${es.p}">
      Hi ${name}, your membership in <strong style="${es.strong}">${orgName}</strong> on E-Voting has been removed by an administrator.
    </p>

    <div style="${es.card('#3b82f6')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Membership Change</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Removed By:</strong> ${removedByName}</p>
    </div>

    <p style="${es.p}">
      You will no longer have access to this organization's elections, voter data, or settings. Your E-Voting account remains active and you can still access any other organizations you belong to.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}" style="${es.button('#3b82f6')}">Go to Dashboard</a>
    </div>

    <p style="${es.small}">
      If you believe this was done in error, please contact your organization administrator or reach out to our support team.
    </p>
  `
  return renderEmailLayout(content, `Membership Removed: ${orgName} — E-Voting`, 'info')
}
