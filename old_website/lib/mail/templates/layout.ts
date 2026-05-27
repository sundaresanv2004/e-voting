export type EmailCategory = 'success' | 'info' | 'security' | 'warning'

const CATEGORY_CONFIG: Record<EmailCategory, {
  accentColor: string
  badge: string
  badgeBg: string
  badgeColor: string
}> = {
  success: {
    accentColor: '#10b981',
    badge: '&#10003;&nbsp; Success',
    badgeBg: '#dcfce7',
    badgeColor: '#166534',
  },
  info: {
    accentColor: '#3b82f6',
    badge: '&#8250;&nbsp; Notification',
    badgeBg: '#dbeafe',
    badgeColor: '#1e40af',
  },
  security: {
    accentColor: '#f59e0b',
    badge: '&#9888;&nbsp; Security Alert',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
  },
  warning: {
    accentColor: '#ef4444',
    badge: '&#9888;&nbsp; Important Notice',
    badgeBg: '#fee2e2',
    badgeColor: '#991b1b',
  },
}

// Reusable inline style helpers — use these in every template for consistency
export const es = {
  h1: `font-size:22px;font-weight:700;color:#0f172a;margin:0 0 16px 0;line-height:1.3;`,
  p: `font-size:15px;line-height:1.7;color:#475569;margin:0 0 20px 0;`,
  pLast: `font-size:15px;line-height:1.7;color:#475569;margin:0;`,
  small: `font-size:13px;line-height:1.6;color:#94a3b8;margin:0;`,
  smallSpaced: `font-size:13px;line-height:1.6;color:#94a3b8;margin:0 0 16px 0;`,
  row: `font-size:14px;color:#475569;margin:0 0 10px 0;`,
  strong: `color:#0f172a;font-weight:600;`,
  cta: `text-align:center;margin:28px 0;`,
  button: (bg: string) =>
    `display:inline-block;background-color:${bg};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 30px;border-radius:8px;letter-spacing:0.01em;`,
  card: (accentColor: string) =>
    `background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${accentColor};border-radius:8px;padding:20px 24px;margin:0 0 24px 0;`,
  infoCard: `background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:0 0 24px 0;`,
  otpBox: `background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;margin:0 0 24px 0;`,
  otpCode: `font-size:42px;font-weight:800;letter-spacing:14px;color:#0f172a;margin:0;font-family:Courier,monospace;`,
  successBox: `background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;text-align:center;margin:0 0 24px 0;`,
  warningBox: `background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin:0 0 24px 0;`,
  divider: `border:none;border-top:1px solid #f1f5f9;margin:24px 0;`,
  link: `color:#3b82f6;text-decoration:none;word-break:break-all;font-size:13px;`,
}

export const renderEmailLayout = (
  content: string,
  title: string = 'E-Voting',
  category: EmailCategory = 'info'
): string => {
  const cfg = CATEGORY_CONFIG[category]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Accent Strip -->
          <tr>
            <td style="background-color:${cfg.accentColor};height:4px;border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 40px 24px;text-align:center;">
              <!-- Wordmark -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px auto;">
                <tr>
                  <td style="background-color:${cfg.accentColor};width:30px;height:30px;border-radius:7px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:15px;font-weight:800;line-height:30px;display:block;">E</span>
                  </td>
                  <td style="padding-left:9px;vertical-align:middle;">
                    <span style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">E-Voting</span>
                  </td>
                </tr>
              </table>
              <!-- Category Badge -->
              <span style="display:inline-block;background-color:${cfg.badgeBg};color:${cfg.badgeColor};font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:4px 14px;border-radius:100px;">${cfg.badge}</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 4px 4px;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:13px;color:#64748b;">
                <a href="${appUrl}/admin" style="color:#64748b;text-decoration:none;">Dashboard</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:support@evoting.sundaresan.dev" style="color:#64748b;text-decoration:none;">Support</a>
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${year} E-Voting &mdash; Automated notification, please do not reply directly.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
