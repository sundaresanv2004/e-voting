from .layout import render_email_layout

def render_system_registration_email(
    admin_name: str,
    system_name: str,
    host_name: str,
    ip_address: str,
    org_name: str,
    systems_url: str
) -> str:
    content = f"""
    <p>Hello {admin_name or "Administrator"},</p>
    <p>A new hardware terminal has requested registration for <strong>{org_name}</strong>. Please review the terminal details below and approve or reject the request from your dashboard.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e3a8a;">Terminal Request</h3>
      <p style="margin: 4px 0;"><strong>Name:</strong> {system_name}</p>
      <p style="margin: 4px 0;"><strong>Hostname:</strong> {host_name}</p>
      <p style="margin: 4px 0;"><strong>IP Address:</strong> {ip_address}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b; font-weight: 600;">PENDING</span></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{systems_url}" class="button">Review Request</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
        If you do not recognize this hardware, please ignore this email or contact security.
    </p>
    """
    return render_email_layout(content, title="E-Voting Security")
