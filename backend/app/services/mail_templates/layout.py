from datetime import datetime
from app.core.config import settings

def render_email_layout(content: str, title: str = settings.PROJECT_NAME) -> str:
    """Combines content with the base e-voting email layout."""
    year = datetime.now().year
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {{ margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; }}
    .header {{ background-color: #111827; padding: 32px 40px; text-align: center; }}
    .header h1 {{ margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }}
    .content {{ padding: 40px; color: #374151; }}
    .greeting {{ font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #111827; }}
    .message {{ font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 32px; }}
    .otp-container {{ background-color: #f3f4f6; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px; border: 1px solid #e5e7eb; }}
    .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #111827; margin: 0; }}
    .button-container {{ text-align: center; margin-bottom: 32px; }}
    .button {{ background-color: #3b82f6; border-radius: 8px; padding: 12px 32px; color: #ffffff !important; text-decoration: none; font-weight: 600; display: inline-block; }}
    .footer {{ padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6; }}
    .footer p {{ margin: 0; font-size: 13px; color: #6b7280; line-height: 20px; }}
    .link {{ color: #3b82f6; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{title}</h1>
    </div>
    <div class="content">
      {content}
    </div>
    <div class="footer">
      <p>&copy; {year} {title}. All rights reserved.</p>
      <p>Questions? Contact us at <a href="mailto:support@evoting.sundaresan.dev" class="link">support@evoting.sundaresan.dev</a></p>
    </div>
  </div>
</body>
</html>
"""
