import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, name, subject } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const userName = name || 'there'
    const supportSubject = subject || 'your inquiry'

    // Send auto-reply email with headers to avoid spam filters
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: 'Campus Connect Support'
      },
      replyTo: 'campusconnectcapstone@gmail.com',
      subject: 'Thank you for contacting Campus Connect',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Entity-Ref-ID': `support-${Date.now()}`,
      },
      categories: ['support', 'auto-reply'],
      text: `Hi ${userName},

Thank you for reaching out to Campus Connect Support.

We have successfully received your message about "${supportSubject}".

Our support team has been notified and will review your request. We aim to respond within 24 hours during business days (Monday through Friday).

While you wait, these resources may be helpful:
- Help Center: ${process.env.NEXT_PUBLIC_BASE_URL}/help
- Safety Guidelines: ${process.env.NEXT_PUBLIC_BASE_URL}/safety
- Privacy Policy: ${process.env.NEXT_PUBLIC_BASE_URL}/privacy

For urgent matters, please include "URGENT" in your message subject.

Thank you for being part of the Campus Connect community.

Best regards,
Campus Connect Support Team

campusconnectcapstone@gmail.com
${process.env.NEXT_PUBLIC_BASE_URL}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Campus Connect Support Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0ea5e9; padding: 30px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Campus Connect Support</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                        Thank you for reaching out to Campus Connect Support.
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; margin: 0 0 25px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="color: #0c4a6e; margin: 0; font-size: 15px; line-height: 1.6;">
                              We have successfully received your message about <strong>"${supportSubject}"</strong>.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                        Our support team has been notified and will review your request. We aim to respond within <strong>24 hours</strong> during business days.
                      </p>
                      
                      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                        <strong>Helpful Resources:</strong>
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 25px 0;">
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/help" style="color: #0ea5e9; text-decoration: none; font-size: 14px;">Help Center</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 8px;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/safety" style="color: #0ea5e9; text-decoration: none; font-size: 14px;">Safety Guidelines</a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy" style="color: #0ea5e9; text-decoration: none; font-size: 14px;">Privacy Policy</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 30px 0;">
                        Thank you for being part of the Campus Connect community.
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 20px 0;" />
                      
                      <p style="color: #666666; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
                        Best regards,<br/>
                        <strong>Campus Connect Support Team</strong>
                      </p>
                      
                      <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 0;">
                        <a href="mailto:campusconnectcapstone@gmail.com" style="color: #0ea5e9; text-decoration: none;">campusconnectcapstone@gmail.com</a><br/>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #0ea5e9; text-decoration: none;">${process.env.NEXT_PUBLIC_BASE_URL}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        &copy; 2025 Campus Connect. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    await sgMail.send(msg)

    return NextResponse.json(
      { message: 'Auto-reply sent successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Support auto-reply error:', error)
    
    // Handle SendGrid specific errors
    if (error.response) {
      console.error('SendGrid error:', error.response.body)
    }

    return NextResponse.json(
      { error: 'Failed to send auto-reply' },
      { status: 500 }
    )
  }
}
