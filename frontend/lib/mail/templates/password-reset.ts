import { renderEmailLayout } from "./layout"

export const PasswordResetTemplate = (resetLink: string) => {
  const content = `
    <div class="greeting">Reset your password</div>
    <div class="message">
      A password reset was requested for your account. If this was you, please click the button below to set a new password.
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    <div class="message">
      This link will expire in 1 hour. If you did not request this, you can safely ignore this email.
    </div>
    <div class="footer-note" style="margin-top: 24px; font-size: 12px; color: #8898aa;">
      If you're having trouble clicking the button, copy and paste the URL below into your browser: <br />
      <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
    </div>
  `
  return renderEmailLayout(content, "Reset Password - E-Voting")
}
