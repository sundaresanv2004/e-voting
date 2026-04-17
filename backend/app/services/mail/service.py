import resend
from app.core.config import settings
from .templates.system_registration import render_system_registration_email
from .templates.system_expired import render_system_expired_email

class MailService:
    def __init__(self):
        if settings.RESEND_API_KEY:
            resend.api_key = settings.RESEND_API_KEY
        self.from_email = f"E-Voting <{settings.EMAIL_FROM}>"

    async def send_system_registration_email(
        self, 
        to_email: str, 
        admin_name: str, 
        system_name: str, 
        host_name: str, 
        ip_address: str, 
        org_name: str
    ):
        if not settings.RESEND_API_KEY:
            print(f"Skipping email (Registration): No API Key. To: {to_email}")
            return

        systems_url = f"{settings.WEBSITE_URL}/admin/organization/systems"
        html_content = render_system_registration_email(
            admin_name=admin_name,
            system_name=system_name,
            host_name=host_name,
            ip_address=ip_address,
            org_name=org_name,
            systems_url=systems_url
        )

        try:
            params = {
                "from": self.from_email,
                "to": to_email,
                "subject": f"New Terminal Connection Request: {system_name}",
                "html": html_content
            }
            resend.Emails.send(params)
        except Exception as e:
            print(f"Failed to send registration email: {e}")

    async def send_system_expired_email(
        self, 
        to_email: str, 
        admin_name: str, 
        system_name: str, 
        host_name: str, 
        ip_address: str, 
        org_name: str
    ):
        if not settings.RESEND_API_KEY:
            print(f"Skipping email (Expired): No API Key. To: {to_email}")
            return

        systems_url = f"{settings.WEBSITE_URL}/admin/organization/systems"
        html_content = render_system_expired_email(
            admin_name=admin_name,
            system_name=system_name,
            host_name=host_name,
            ip_address=ip_address,
            org_name=org_name,
            systems_url=systems_url
        )

        try:
            params = {
                "from": self.from_email,
                "to": to_email,
                "subject": f"Terminal Session Expired: {system_name}",
                "html": html_content
            }
            resend.Emails.send(params)
        except Exception as e:
            print(f"Failed to send expired email: {e}")

mail_service = MailService()
