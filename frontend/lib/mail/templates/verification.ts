import { renderEmailLayout } from "./layout"

export const VerificationTemplate = (token: string) => {
  const content = `
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
  `
  return renderEmailLayout(content, "E-Voting System")
}
