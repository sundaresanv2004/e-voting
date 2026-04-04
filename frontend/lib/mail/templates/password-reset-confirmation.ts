import { renderEmailLayout } from "./layout"

export const PasswordResetConfirmationTemplate = () => {
  const content = `
    <div class="greeting">Password Reset Successful</div>
    <div class="message">
      Your password has been reset successfully. If you did not perform this action, please contact our support team immediately.
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 16px; border-radius: 8px;">
        Your password has been changed.
      </div>
    </div>
    <div class="message">
      You can now log in with your new password.
    </div>
  `
  return renderEmailLayout(content, "Password Updated - E-Voting")
}
