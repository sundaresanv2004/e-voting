import { renderEmailLayout, es } from './layout'

export const LoginNotificationTemplate = (name: string, ip: string, userAgent: string) => {
  let browser = 'Unknown Browser'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
  else if (userAgent.includes('Edg')) browser = 'Microsoft Edge'

  let os = 'Unknown OS'
  if (userAgent.includes('Macintosh')) os = 'macOS'
  else if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('Linux')) os = 'Linux'

  const displayIp = ip === '::1' || ip === '127.0.0.1' ? '127.0.0.1 (Localhost)' : ip
  const time = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/forgot-password`

  const content = `
    <h2 style="${es.h1}">New sign-in detected</h2>
    <p style="${es.p}">
      Hi ${name}, we noticed a new login to your E-Voting account. Here are the details:
    </p>

    <div style="${es.card('#f59e0b')}">
      <p style="${es.row}"><strong style="${es.strong}">Device:</strong> ${browser} on ${os}</p>
      <p style="${es.row}"><strong style="${es.strong}">IP Address:</strong> ${displayIp}</p>
      <p style="margin:0;font-size:14px;color:#475569;"><strong style="${es.strong}">Time:</strong> ${time}</p>
    </div>

    <p style="${es.p}">
      If this was you, no action is required. If you don't recognize this activity, secure your account immediately.
    </p>

    <div style="${es.cta}">
      <a href="${resetLink}" style="${es.button('#ef4444')}">Secure My Account</a>
    </div>

    <p style="${es.small}">
      As a security measure, we send this notification every time a new sign-in is detected on your account.
    </p>
  `
  return renderEmailLayout(content, 'New Sign-in Detected — E-Voting', 'security')
}
