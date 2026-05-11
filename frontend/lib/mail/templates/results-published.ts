import { renderEmailLayout, es } from './layout'

export const ElectionResultsPublishedTemplate = (
  recipientName: string,
  electionName: string,
  orgName: string,
  totalVoters: number,
  totalBallots: number,
  turnout: number,
  electionId: string
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Election results are published</h2>
    <p style="${es.p}">
      Hi ${recipientName}, the results for <strong style="${es.strong}">${electionName}</strong> in <strong style="${es.strong}">${orgName}</strong> have been finalized and published.
    </p>

    <div style="${es.card('#10b981')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Election Summary</p>
      <p style="${es.row}"><strong style="${es.strong}">Election:</strong> ${electionName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Total Voters:</strong> ${totalVoters.toLocaleString()}</p>
      <p style="${es.row}"><strong style="${es.strong}">Ballots Cast:</strong> ${totalBallots.toLocaleString()}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Voter Turnout:</strong> ${turnout.toFixed(1)}%</p>
    </div>

    <p style="${es.p}">
      The full breakdown of results — including per-role vote counts — is available in your election dashboard.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/election/${electionId}/results" style="${es.button('#10b981')}">View Full Results</a>
    </div>
  `
  return renderEmailLayout(content, `Results Published: ${electionName} — E-Voting`, 'success')
}
