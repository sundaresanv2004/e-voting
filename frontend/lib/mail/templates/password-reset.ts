import { renderEmailLayout, es } from './layout'

export const PasswordResetTemplate = (resetLink: string) => {
  const content = `
    <h2 style="${es.h1}">Reset your password</h2>
    <p style="${es.p}">
      We received a request to reset the password for your E-Voting account. Click the button below to set a new one. This link is valid for <strong style="${es.strong}">1 hour</strong>.
    </p>

    <div style="${es.cta}">
      <a href="${resetLink}" style="${es.button('#0f172a')}">Reset Password</a>
    </div>

    <hr style="${es.divider}" />

    <p style="${es.smallSpaced}">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px 0;">
      <a href="${resetLink}" style="${es.link}">${resetLink}</a>
    </p>

    <p style="${es.small}">
      If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
  `
  return renderEmailLayout(content, 'Reset your password — E-Voting', 'security')
}
