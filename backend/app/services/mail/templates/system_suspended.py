from .layout import render_email_layout

def render_system_suspended_email(
    admin_name: str,
    system_name: str,
    host_name: str,
    ip_address: str,
    org_name: str,
    systems_url: str,
    reason: str = "User initiated logout"
) -> str:
    content = f"""
    <p>Hello {admin_name or "Administrator"},</p>
    <p>The terminal <strong>{system_name}</strong> in <strong>{org_name}</strong> has been <strong>SUSPENDED</strong>. Local session data has been cleared and the terminal is now disconnected from the security grid.</p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Disconnection Audit</h3>
      <p style="margin: 4px 0;"><strong>Terminal:</strong> {system_name}</p>
      <p style="margin: 4px 0;"><strong>Hostname:</strong> {host_name}</p>
      <p style="margin: 4px 0;"><strong>IP Address:</strong> {ip_address}</p>
      <p style="margin: 4px 0;"><strong>Reason:</strong> {reason}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #6b7280; font-weight: 600;">SUSPENDED</span></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{systems_url}" class="button">Manage Terminal</a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
        To restore this terminal, you will need to re-approve its connection request from the administration dashboard.
    </p>
    """
    return render_email_layout(content, title="E-Voting Security Alert")
