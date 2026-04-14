import { renderEmailLayout } from "./layout"

export const LoginNotificationTemplate = (name: string, ip: string, userAgent: string) => {
  // Simple parser to make the User Agent human-readable
  let device = "Unknown Device"
  if (userAgent.includes("Chrome")) device = "Chrome"
  else if (userAgent.includes("Firefox")) device = "Firefox"
  else if (userAgent.includes("Safari")) device = "Safari"
  else if (userAgent.includes("Edge")) device = "Edge"

  let os = "Unknown OS"
  if (userAgent.includes("Macintosh")) os = "macOS"
  else if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS"
  else if (userAgent.includes("Android")) os = "Android"

  const readableDevice = `${device} on ${os}`
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/forgot-password`

  const content = `
    <div class="greeting">New Login Detected</div>
    <div class="message">
      Hi ${name}, a new login was detected on your E-Voting account.
    </div>
    <div style="background-color: #fafafa; border: 1px solid #eeeeee; padding: 20px; border-radius: 12px; margin: 24px 0;">
      <div style="margin-bottom: 12px; font-size: 14px; color: #666;">
        <strong style="color: #111;">Device:</strong> ${readableDevice}
      </div>
      <div style="margin-bottom: 12px; font-size: 14px; color: #666;">
        <strong style="color: #111;">IP Address:</strong> ${ip === "::1" ? "127.0.0.1 (Localhost)" : ip}
      </div>
      <div style="font-size: 14px; color: #666;">
        <strong style="color: #111;">Time:</strong> ${new Date().toLocaleString()}
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">
        Secure My Account (Reset Password)
      </a>
    </div>

    <div class="message" style="margin-bottom: 0; font-size: 13px; color: #888;">
      If this was you, you can safely ignore this email. If you don't recognize this activity, please click the button above to secure your account immediately.
    </div>
  `
  return renderEmailLayout(content, "Security Alert")
}
