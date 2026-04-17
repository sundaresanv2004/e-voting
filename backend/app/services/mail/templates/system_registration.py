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
    <div class="greeting">Hello {admin_name or "Administrator"},</div>
    <div class="message">
        A new hardware terminal has requested registration for <strong>{org_name}</strong>. 
        Please review the terminal details below and approve or reject the request from your administration dashboard.
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
            <span style="color: #f59e0b; font-weight: 700;">PENDING</span>
        </div>
    </div>
    
    <div class="button-container">
        <a href="{systems_url}" class="button">Review Request</a>
    </div>
    
    <div class="message">
        If you don't recognize this hardware, please ignore this email or contact security.
    </div>
    """
    return render_email_layout(content, title="E-Voting Security")
