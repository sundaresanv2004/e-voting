from .layout import render_email_layout

def render_system_expired_email(
    admin_name: str,
    system_name: str,
    host_name: str,
    ip_address: str,
    org_name: str,
    systems_url: str
) -> str:
    content = f"""
    <p>Hello {admin_name or "Administrator"},</p>
    <p>The security token for the terminal <strong>{system_name}</strong> in <strong>{org_name}</strong> has expired. The terminal is now offline and requires re-authorization to resume operations.</p>
    
    <div style="background-color: #fffaf0; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #92400e;">Hardware Context</h3>
      <p style="margin: 4px 0;"><strong>Terminal:</strong> {system_name}</p>
      <p style="margin: 4px 0;"><strong>Hostname:</strong> {host_name}</p>
      <p style="margin: 4px 0;"><strong>IP Address:</strong> {ip_address}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #ef4444; font-weight: 600;">EXPIRED</span></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{systems_url}" class="button">Re-authorize Terminal</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
        If this terminal is no longer in use, you can safely ignore this notification or revoke access permanently from the dashboard.
    </p>
    """
    return render_email_layout(content, title="E-Voting Security")
