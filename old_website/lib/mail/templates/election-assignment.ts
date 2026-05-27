import { renderEmailLayout, es } from './layout'

export const ElectionAssignmentTemplate = (name: string, orgName: string, electionName: string, role: string, electionId: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">You've been assigned to an election</h2>
    <p style="${es.p}">
      Hi ${name}, you have been granted access to manage <strong style="${es.strong}">${electionName}</strong> under <strong style="${es.strong}">${orgName}</strong>.
    </p>

    <div style="${es.card('#3b82f6')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Assignment Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Election:</strong> ${electionName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Your Role:</strong> ${role}</p>
    </div>

    <p style="${es.p}">
      You can now access this election's dashboard to review configuration, monitor voter turnout, manage candidates, and verify results.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/election/${electionId}" style="${es.button('#3b82f6')}">Open Election Dashboard</a>
    </div>

    <p style="${es.small}">
      If you have questions about your responsibilities, contact your organization administrator.
    </p>
  `
  return renderEmailLayout(content, `Election Assignment: ${electionName} — E-Voting`, 'info')
}
