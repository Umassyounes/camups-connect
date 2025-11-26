# Support Auto-Reply Setup Guide

## Overview
This system automatically sends a confirmation email from `noreply@umbconnect.com` when users contact support or subscribe to the newsletter.

## Features Implemented

### 1. Newsletter Auto-Reply (`/api/newsletter`)
- Sends welcome email when users subscribe via the footer
- Confirms subscription and lists what they'll receive
- Professional HTML email template

### 2. Support Auto-Reply (`/api/support-autoreply`)
- Sends confirmation email when users submit support requests
- Informs them of 24-hour response time
- Provides links to help resources
- Professional HTML email template

### 3. Contact Form (`/contact`)
- User-friendly form for submitting support requests
- Automatically triggers auto-reply email
- Shows confirmation message to user

## How It Works

### When Users Contact Support:
1. User fills out the contact form at `/contact`
2. Form submits to `/api/support-autoreply`
3. API validates the email
4. SendGrid sends auto-reply from `noreply@umbconnect.com`
5. User receives confirmation email immediately
6. You (support team) receive the actual support request at `campusconnectcapstone@gmail.com`

### When Users Subscribe to Newsletter:
1. User enters email in footer
2. Form submits to `/api/newsletter`
3. API validates the email
4. SendGrid sends welcome email from `noreply@umbconnect.com`
5. User receives welcome email with subscription details

## SendGrid Configuration

### Current Setup (Already Configured):
- **SendGrid API Key**: Set in `.env.local` as `SENDGRID_API_KEY`
- **From Email**: `noreply@umbconnect.com` (set as `SENDGRID_FROM_EMAIL`)
- **Support Email**: `campusconnectcapstone@gmail.com` (hardcoded in emails)

### SendGrid Email Forwarding (Optional but Recommended):

To automatically forward support requests to `campusconnectcapstone@gmail.com` and trigger auto-replies:

#### Option 1: SendGrid Inbound Parse Webhook
1. Log into SendGrid Dashboard
2. Go to Settings > Inbound Parse
3. Add a new host & URL:
   - **Hostname**: `support.umbconnect.com` (or subdomain of your choice)
   - **URL**: `https://umbconnect.com/api/inbound-email` (you'll need to create this endpoint)
   - **Check**: "POST the raw, full MIME message"
4. Set up DNS MX records to point to SendGrid:
   ```
   MX Record: mx.sendgrid.net (priority 10)
   ```
5. When email arrives at `support@umbconnect.com`, SendGrid will:
   - Forward it to `campusconnectcapstone@gmail.com`
   - Trigger auto-reply to sender

#### Option 2: Gmail Forwarding (Simpler)
1. Log into `campusconnectcapstone@gmail.com`
2. Go to Settings > Forwarding and POP/IMAP
3. Add forwarding address (if needed)
4. Create a filter:
   - **From**: Any email
   - **To**: campusconnectcapstone@gmail.com
   - **Action**: Apply label "Support Request"

Then use the contact form at `/contact` to trigger auto-replies automatically.

#### Option 3: Use Contact Form Only (Current Implementation)
- Users submit requests via `/contact` form
- They receive auto-reply immediately
- You manually check `campusconnectcapstone@gmail.com` for actual requests
- This is the simplest approach and is already working!

## Testing

### Test Newsletter Signup:
1. Go to your site
2. Scroll to footer
3. Enter email in "Stay Updated" section
4. Click "Join"
5. Check email for welcome message from `noreply@umbconnect.com`

### Test Support Auto-Reply:
1. Go to `/contact`
2. Fill out the form with your email
3. Click "Send Message"
4. Check email for confirmation from `noreply@umbconnect.com`

## Email Templates

Both auto-reply emails include:
- Campus Connect branding
- Clear confirmation message
- Response time expectations
- Links to help resources
- Professional HTML styling
- Mobile-responsive design

## Notes

- Auto-replies are sent from `noreply@umbconnect.com` (verified SendGrid sender)
- Actual support emails go to `campusconnectcapstone@gmail.com`
- All emails use SendGrid for reliable delivery
- HTML templates are responsive and branded
- Error handling included for failed sends

## Troubleshooting

If emails aren't sending:
1. Check SendGrid API key in `.env.local`
2. Verify `noreply@umbconnect.com` is verified in SendGrid
3. Check SendGrid dashboard for delivery stats
4. Review server logs for error messages

## Future Enhancements

Possible improvements:
- Add email templates for different support categories
- Implement ticket tracking system
- Add support for file attachments
- Create admin dashboard for viewing support requests
- Add email threading for follow-up responses
