import { renderEmailLayout, es } from './layout'

export const OrgInvitationTemplate = (name: string, orgName: string, role: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">You've been added to ${orgName}</h2>
    <p style="${es.p}">
      Hi ${name}, you now have access to <strong style="${es.strong}">${orgName}</strong> on E-Voting. Your assigned role is <strong style="${es.strong}">${role}</strong>.
    </p>

    <div style="${es.card('#3b82f6')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Membership Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Role:</strong> ${role}</p>
    </div>

    <p style="${es.p}">
      As a member, you can collaborate on elections, manage voter data, and monitor results — depending on your role permissions.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/organization" style="${es.button('#3b82f6')}">Access Organization</a>
    </div>

    <p style="${es.small}">
      If you believe you received this email in error, please contact your organization administrator.
    </p>
  `
  return renderEmailLayout(content, `You've joined ${orgName} — E-Voting`, 'info')
}
