import { renderEmailLayout, es } from './layout'
import { format } from 'date-fns'

export const ElectionCreatedNotificationTemplate = (
  recipientName: string,
  orgName: string,
  electionName: string,
  electionCode: string,
  startTime: Date,
  endTime: Date,
  creatorName: string,
  electionId: string
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">New election created</h2>
    <p style="${es.p}">
      Hi ${recipientName}, a new election has been created in <strong style="${es.strong}">${orgName}</strong> by <strong style="${es.strong}">${creatorName}</strong>.
    </p>

    <div style="${es.card('#10b981')}">
      <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Election Details</p>
      <p style="${es.row}"><strong style="${es.strong}">Name:</strong> ${electionName}</p>
      <p style="${es.row}"><strong style="${es.strong}">Code:</strong> <span style="font-family:Courier,monospace;background-color:#f1f5f9;padding:2px 8px;border-radius:4px;">${electionCode}</span></p>
      <p style="${es.row}"><strong style="${es.strong}">Starts:</strong> ${format(startTime, 'PPP p')}</p>
      <p style="${es.row}"><strong style="${es.strong}">Ends:</strong> ${format(endTime, 'PPP p')}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Created By:</strong> ${creatorName}</p>
    </div>

    <p style="${es.p}">
      Review the election configuration, add candidates, and manage the voter list from your dashboard before the election goes live.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/admin/election/${electionId}" style="${es.button('#10b981')}">Open Election Dashboard</a>
    </div>
  `
  return renderEmailLayout(content, `New Election: ${electionName} — E-Voting`, 'success')
}
