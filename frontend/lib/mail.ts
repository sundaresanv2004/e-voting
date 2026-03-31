import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    // If no API key is provided, log the token to the console for development
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re-placeholder") {
      console.log(`[DEV] Verification code for ${email}: ${token}`)
      return { success: true, dev: true }
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "E-Voting <verify@yourdomain.com>",
      to: email,
      subject: "Verify your email - E-Voting System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; }
            .header { background-color: #111827; padding: 32px 40px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .content { padding: 40px; color: #374151; }
            .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; }
            .message { font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 32px; }
            .otp-container { background-color: #f3f4f6; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px; border: 1px solid #e5e7eb; }
            .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #111827; margin: 0; }
            .footer { padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6; }
            .footer p { margin: 0; font-size: 13px; color: #6b7280; line-height: 20px; }
            .link { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>E-Voting System</h1>
            </div>
            <div class="content">
              <div class="greeting">Verify your email address</div>
              <div class="message">
                Thanks for starting the new E-Voting account creation process. We want to make sure it's really you. Please enter the following verification code when prompted.
              </div>
              <div class="otp-container">
                <div class="otp-code">${token}</div>
              </div>
              <div class="message" style="margin-bottom: 0;">
                If you didn't request this email, there's nothing to worry about — you can safely ignore it. The code will expire in 1 hour.
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} E-Voting System. All rights reserved.</p>
              <p>Questions? Contact us at <a href="mailto:support@evoting.sundaresan.dev" class="link">support@evoting.sundaresan.dev</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return { success: false, error }
  }
}
