import { renderEmailLayout, es } from './layout'

export const OrganizationCreatedTemplate = (name: string, orgName: string, orgCode: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Organization created successfully</h2>
    <p style="${es.p}">
      Hi ${name}, your organization <strong style="${es.strong}">${orgName}</strong> is live on E-Voting. You're the Owner and have full administrative control.
    </p>

    <div style="${es.card('#10b981')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Organization Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Name:</strong> ${orgName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Code:</strong> <span style="font-family:Courier,monospace;background-color:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:14px;">${orgCode}</span></p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Your Role:</strong> Organization Owner (Admin)</p>
    </div>

    <p style="${es.p}">
      Your organization code is required to register physical voting terminals. Keep it secure and only share it with trusted administrators.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/organization" style="${es.button('#10b981')}">Manage Organization</a>
    </div>
  `
  return renderEmailLayout(content, `${orgName} is ready — E-Voting`, 'success')
}
