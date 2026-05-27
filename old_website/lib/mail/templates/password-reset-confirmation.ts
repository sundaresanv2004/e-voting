import { renderEmailLayout, es } from './layout'

export const PasswordResetConfirmationTemplate = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Password updated successfully</h2>
    <p style="${es.p}">
      Your E-Voting account password has been changed. You can now sign in using your new credentials.
    </p>

    <div style="${es.successBox}">
      <p style="margin:0;font-size:15px;font-weight:600;color:#166534;">&#10003;&nbsp; Password changed on ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
    </div>

    <div style="${es.cta}">
      <a href="${appUrl}/auth/login" style="${es.button('#10b981')}">Sign In Now</a>
    </div>

    <p style="${es.small}">
      If you did not make this change, please <a href="mailto:support@evoting.sundaresan.dev" style="color:#ef4444;text-decoration:none;">contact our support team immediately</a> to secure your account.
    </p>
  `
  return renderEmailLayout(content, 'Password Updated — E-Voting', 'success')
}
