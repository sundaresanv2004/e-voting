from .layout import render_email_layout

def verification_template(code: str) -> str:
    """Returns the rendered verification email HTML."""
    content = f"""
    <div class="greeting">Verify your email address</div>
    <div class="message">
      Thanks for starting the new E-Voting account creation process. We want to make sure it's really you. Please enter the following verification code when prompted.
    </div>
    <div class="otp-container">
      <div class="otp-code">{code}</div>
    </div>
    <div class="message" style="margin-bottom: 0;">
      If you didn't request this email, there's nothing to worry about — you can safely ignore it. The code will expire in 10 minutes.
    </div>
    """
    return render_email_layout(content)
