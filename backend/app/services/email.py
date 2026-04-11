import httpx
from app.core.config import settings
from app.services.mail_templates.verification import verification_template
from app.services.mail_templates.welcome import welcome_template

async def send_verification_email(email: str, code: str):
    """Sends a verification email using the Resend service."""
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY == "re_PLACEHOLDER":
        print(f"--- [EMAIL MOCK] (No API Key) ---")
        print(f"To: {email}, Code: {code}")
        return

    html = verification_template(code)
    sender = f"{settings.PROJECT_NAME} <{settings.EMAIL_FROM}>"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender,
                    "to": [email],
                    "subject": "Your Verification Code - E-Voting",
                    "html": html,
                },
            )
            
            if response.status_code != 200 and response.status_code != 201:
                print(f"[Resend Error] Status: {response.status_code}, Body: {response.text}")
                
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"[Resend HTTP Error] {e.response.status_code}: {e.response.text}")
            raise
        except Exception as e:
            print(f"[Resend Service Error] {str(e)}")
            raise

async def send_welcome_email(email: str, name: str):
    """Sends a welcome email using the Resend service."""
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY == "re_PLACEHOLDER":
        print(f"--- [WELCOME EMAIL MOCK] (No API Key) ---")
        print(f"To: {email}, Name: {name}")
        return

    html = welcome_template(name)
    sender = f"{settings.PROJECT_NAME} <{settings.EMAIL_FROM}>"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender,
                    "to": [email],
                    "subject": f"Welcome to {settings.PROJECT_NAME}! 🎉",
                    "html": html,
                },
            )
            
            if response.status_code != 200 and response.status_code != 201:
                print(f"[Resend Error] Status: {response.status_code}, Body: {response.text}")
                
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"[Resend HTTP Error] {e.response.status_code}: {e.response.text}")
            raise
        except Exception as e:
            print(f"[Resend Service Error] {str(e)}")
            raise
