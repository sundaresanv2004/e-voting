import { renderEmailLayout, es } from './layout'

export const AccountLockedTemplate = (name: string, unlockTime?: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Your account has been temporarily locked</h2>
    <p style="${es.p}">
      Hi ${name}, your E-Voting account has been locked due to multiple consecutive failed login attempts. This is an automated security measure to protect your account.
    </p>

    <div style="${es.card('#ef4444')}">
      <p style="margin:0 0 8px 0;font-size:14px;color:#475569;"><strong style="${es.strong}">Reason:</strong> Too many failed login attempts</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Locked Until:</strong> ${unlockTime || 'Temporarily — please wait a few minutes and try again'}</p>
    </div>

    <p style="${es.p}">
      If this was you, please wait for the lock to expire and try again with the correct credentials. If you've forgotten your password, you can reset it now.
    </p>

    <div style="${es.cta}">
      <a href="${appUrl}/auth/forgot-password" style="${es.button('#ef4444')}">Reset Password</a>
    </div>

    <p style="${es.small}">
      If you did not attempt to log in, your account may be under a brute-force attack. Please reset your password immediately and contact support.
    </p>
  `
  return renderEmailLayout(content, 'Account Locked — E-Voting', 'warning')
}
