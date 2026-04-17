import { renderEmailLayout } from "./layout"
import { format } from "date-fns"

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
  const content = `
    <div class="greeting">New Election Created! 🗳️</div>
    <div class="message">
      Hi ${recipientName}, a new election has been successfully created within <strong>${orgName}</strong>.
    </div>
    
    <div style="background-color: #f7fee7; border: 1px solid #d9f99d; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
      <h3 style="margin-top: 0; color: #365314; font-size: 16px;">Election Details</h3>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #365314;"><strong>Election Name:</strong> ${electionName}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #365314;"><strong>Election Code:</strong> <code>${electionCode}</code></p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #365314;"><strong>Start Time:</strong> ${format(startTime, "PPP p")}</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #365314;"><strong>End Time:</strong> ${format(endTime, "PPP p")}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #365314; padding-top: 10px; border-top: 1px dashed #d9f99d;"><strong>Created By:</strong> ${creatorName}</p>
    </div>

    <div class="message">
      The election is currently being prepared. You can review the configuration, manage candidates, and oversee the voter list from your dashboard.
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/election/${electionId}" class="button" style="background-color: #65a30d;">
        View Election Dashboard
      </a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      As a member of the administration, you have oversight of all ongoing and upcoming elections.
    </div>
  `
  return renderEmailLayout(content, "E-Voting")
}
