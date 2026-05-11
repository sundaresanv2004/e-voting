import { renderEmailLayout, es } from './layout'

export const VerificationTemplate = (token: string) => {
  const content = `
    <h2 style="${es.h1}">Verify your email address</h2>
    <p style="${es.p}">
      Thanks for signing up for E-Voting. To complete your registration, please enter the verification code below when prompted. The code is valid for <strong style="${es.strong}">1 hour</strong>.
    </p>

    <div style="${es.otpBox}">
      <p style="margin:0 0 10px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Your Verification Code</p>
      <p style="${es.otpCode}">${token}</p>
    </div>

    <p style="${es.small}">
      If you didn't create an E-Voting account, you can safely ignore this email — no account will be created without verification.
    </p>
  `
  return renderEmailLayout(content, 'Verify your email — E-Voting', 'info')
}
