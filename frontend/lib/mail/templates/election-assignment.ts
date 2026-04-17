import { renderEmailLayout } from "./layout"

export const ElectionAssignmentTemplate = (name: string, orgName: string, electionName: string, role: string, electionId: string) => {
  const content = `
    <div class="greeting">You've been assigned to ${electionName}! 🗳️</div>
    <div class="message">
      Hi ${name}, you have been assigned to help manage or view <strong>${electionName}</strong>. 
      Your role in this election is <strong>${role}</strong>.
    </div>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #111827; font-size: 16px;">What you can do:</h3>
      <ul style="margin-bottom: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
        <li>Access election configurations</li>
        <li>Monitor voter turnout</li>
        <li>View or manage candidate details</li>
        <li>Verify results after conclusion</li>
      </ul>
    </div>

    <div class="message">
      You can now access this election from your dashboard.
    </div>

    <div class="button-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/election/${electionId}" class="button">Go to Election</a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      If you have any questions or need clarify on your responsibilities, please contact your organization administrator.
    </div>
  `
  return renderEmailLayout(content, orgName)
}
