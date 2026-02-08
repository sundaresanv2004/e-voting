# Email Templates for Supabase

Professional HTML email templates for your E-Voting application's authentication flow.

## Templates

### 1. verify-email.html
Email verification template sent when users sign up.

**Supabase Variables:**
- `{{ .ConfirmationURL }}` - The verification link

**Features:**
- Modern gradient design
- Responsive layout
- Clear call-to-action button
- Alternative copy-paste link
- Security notice
- Mobile-friendly

### 2. welcome.html
Welcome email sent after successful email verification (optional).

**Supabase Variables:**
- `{{ .SiteURL }}` - Your application URL

**Features:**
- Success confirmation
- Feature highlights
- Dashboard link
- Clean, celebratory design

## How to Use with Supabase

### Step 1: Access Email Templates in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select the template you want to customize (e.g., "Confirm signup")

### Step 2: Update the Template

1. Copy the content from `verify-email.html`
2. Paste it into the Supabase email template editor
3. Make sure the `{{ .ConfirmationURL }}` variable is included
4. Save the template

### Step 3: Customize (Optional)

You can customize:
- Colors (update gradient values)
- Logo (add your own logo image)
- Text content
- Footer information
- Support email address

## Available Supabase Variables

When creating email templates in Supabase, you can use these variables:

### Confirmation Email
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Confirmation token (not recommended to show directly)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

### Password Recovery
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Recovery token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

### Magic Link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Magic link token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

## Design Specifications

### Color Palette
- Primary Gradient: `#6366f1` → `#8b5cf6` (Indigo to Purple)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Text Primary: `#18181b` (Zinc 900)
- Text Secondary: `#71717a` (Zinc 500)
- Background: `#f4f4f5` (Zinc 100)

### Typography
- Font: System font stack (Apple system, Segoe UI, Roboto)
- Heading: 28px, bold
- Body: 16px, regular
- Small text: 13-14px

### Layout
- Max width: 600px
- Padding: 40px
- Border radius: 12px
- Box shadow: Subtle elevation

## Email Client Compatibility

These templates are tested and compatible with:
- ✅ Gmail (Web, iOS, Android)
- ✅ Apple Mail (macOS, iOS)
- ✅ Outlook (Web, Desktop)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

## Best Practices

1. **Test Before Deploying**
   - Send test emails to multiple email clients
   - Check on both desktop and mobile

2. **Keep It Simple**
   - Avoid complex CSS that email clients might not support
   - Use inline styles (already done in templates)
   - Tables for layout (email standard)

3. **Security**
   - Never expose sensitive tokens in plain text
   - Include security notices about link expiration
   - Add warnings for unexpected emails

4. **Accessibility**
   - Use semantic HTML
   - Include alt text for images
   - Ensure good color contrast
   - Make links clearly visible

## Customization Examples

### Add Your Logo

Replace the SVG icon in the header with your logo:

```html
<td style="padding: 40px 40px 0 40px; text-align: center;">
    <img src="https://your-domain.com/logo.png" 
         alt="E-Voting Logo" 
         width="120" 
         style="display: block; margin: 0 auto 24px;">
</td>
```

### Change Colors

Update the gradient background:

```html
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Add Social Links

Add after the footer:

```html
<tr>
    <td style="text-align: center; padding: 16px 20px 0;">
        <a href="https://twitter.com/yourhandle" style="margin: 0 8px;">
            <img src="https://your-cdn.com/twitter-icon.png" width="24" alt="Twitter">
        </a>
        <a href="https://facebook.com/yourpage" style="margin: 0 8px;">
            <img src="https://your-cdn.com/facebook-icon.png" width="24" alt="Facebook">
        </a>
    </td>
</tr>
```

## Troubleshooting

### Links Not Working
- Ensure `{{ .ConfirmationURL }}` is properly included
- Check that the callback URL is configured in Supabase

### Styling Issues
- Some email clients strip CSS - use inline styles
- Avoid modern CSS features (grid, flexbox)
- Use HTML tables for layout

### Images Not Displaying
- Host images on a CDN or your server
- Use absolute URLs, not relative paths
- Include alt text for accessibility

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Test with Litmus or Email on Acid for comprehensive client testing
