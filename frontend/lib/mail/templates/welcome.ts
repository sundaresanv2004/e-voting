import { renderEmailLayout } from "./layout"

export const WelcomeTemplate = (name: string) => {
  const content = `
    <div class="greeting">Welcome to E-Voting, ${name}! 🎉</div>
    <div class="message">
      We're absolutely thrilled to have you join our secure voting community. Our mission is to provide you with the most transparent, reliable, and user-friendly experience for all your organizational voting needs.
    </div>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
      <h3 style="margin-top: 0; color: #111827; font-size: 16px;">What's next?</h3>
      <ul style="margin-bottom: 0; padding-left: 20px; color: #4b5563; line-height: 1.6;">
        <li>Create or join an organization</li>
        <li>Set up your first election</li>
        <li>Invite team members to participate</li>
      </ul>
    </div>

    <div class="message">
      Ready to get started? Log in to your dashboard to begin setting up your elections.
    </div>

    <div class="button-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" class="button">Go to Dashboard</a>
    </div>

    <div class="message" style="margin-bottom: 0;">
      If you have any questions or need assistance, our support team is always here to help. Just reply to this email!
    </div>
  `
  return renderEmailLayout(content, "E-Voting System")
}
