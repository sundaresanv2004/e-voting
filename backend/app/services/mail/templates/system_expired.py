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
    <div class="greeting">Hello {admin_name or "Administrator"},</div>
    <div class="message">
        The security token for the terminal <strong>{system_name}</strong> in <strong>{org_name}</strong> has expired.
        The terminal is now offline and requires re-authorization to resume operations.
    </div>
    
    <div class="details-container">
        <div class="detail-row">
            <span class="detail-label">Terminal Name:</span>
            <span>{system_name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Host Name:</span>
            <span>{host_name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">IP Address:</span>
            <span>{ip_address}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span style="color: #ef4444; font-weight: 700;">EXPIRED</span>
        </div>
    </div>
    
    <div class="button-container">
        <a href="{systems_url}" class="button">Re-authorize Terminal</a>
    </div>
    
    <div class="message">
        If this terminal is no longer in use, you can safely ignore this notification or revoke the access permanently from the dashboard.
    </div>
    """
    return render_email_layout(content, title="E-Voting Security")
