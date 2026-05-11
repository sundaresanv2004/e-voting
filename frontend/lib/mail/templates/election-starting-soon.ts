import { renderEmailLayout, es } from './layout'
import { format } from 'date-fns'

export const ElectionStartingSoonTemplate = (
  recipientName: string,
  electionName: string,
  orgName: string,
  startTime: Date,
  electionId: string
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Election starting soon</h2>
    <p style="${es.p}">
      Hi ${recipientName}, this is a reminder that <strong style="${es.strong}">${electionName}</strong> under <strong style="${es.strong}">${orgName}</strong> is scheduled to begin shortly.
    </p>

    <div style="${es.card('#3b82f6')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Election Reminder</p>
      <p style="${es.row}"><strong style="${es.strong}">Election:</strong> ${electionName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Organization:</strong> ${orgName}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Starts At:</strong> ${format(startTime, 'PPP p')}</p>
    </div>

    <p style="${es.p}">
      Please ensure that all voting terminals are connected, voter lists are finalized, and candidates are confirmed before the election goes live.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/election/${electionId}" style="${es.button('#3b82f6')}">Open Election Dashboard</a>
    </div>
  `
  return renderEmailLayout(content, `Reminder: ${electionName} Starting Soon — E-Voting`, 'info')
}
