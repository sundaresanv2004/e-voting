import { renderEmailLayout, es } from './layout'

export const WelcomeTemplate = (name: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const content = `
    <h2 style="${es.h1}">Welcome aboard, ${name}! 🎉</h2>
    <p style="${es.p}">
      Your E-Voting account is ready. You're now part of a secure, transparent platform built to power fair elections for organizations of every size.
    </p>

    <div style="${es.infoCard}">
      <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;">Get started in 3 steps</p>
      <p style="${es.row}"><strong style="${es.strong}">1. Create or join an organization</strong><br /><span style="color:#94a3b8;font-size:13px;">Set up your institution or accept an invitation from an existing one.</span></p>
      <p style="${es.row}"><strong style="${es.strong}">2. Set up your first election</strong><br /><span style="color:#94a3b8;font-size:13px;">Configure roles, candidates, and voter lists in minutes.</span></p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">3. Run your election</strong><br /><span style="color:#94a3b8;font-size:13px;">Authorize terminals or enable online voting — secure and auditable.</span></p>
    </div>

    <div style="${es.cta}">
      <a href="${appUrl}" style="${es.button('#10b981')}">Go to Dashboard</a>
    </div>

    <p style="${es.small}">
      Have questions? Reply to this email or contact us at <a href="mailto:support@evoting.sundaresan.dev" style="color:#3b82f6;text-decoration:none;">support@evoting.sundaresan.dev</a>
    </p>
  `
  return renderEmailLayout(content, 'Welcome to E-Voting', 'success')
}
