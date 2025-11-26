import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

export async function POST(request: NextRequest) {
  // Initialize SendGrid with the API key (do this inside the function to ensure env vars are loaded)
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  }
  try {
    const { email } = await request.json()

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

    // Check if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('SendGrid FROM email is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Send welcome email with headers to avoid spam filters
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: 'Campus Connect'
      },
      replyTo: 'campusconnectcapstone@gmail.com',
      subject: 'Welcome to Campus Connect Newsletter',
      headers: {
        'X-Priority': '3',
        'X-Entity-Ref-ID': `newsletter-${Date.now()}`,
      },
      categories: ['newsletter', 'welcome'],
      text: `Thank you for subscribing to the Campus Connect Newsletter!

You are now part of our community and will receive updates about:
- New features and platform improvements
- Campus events and activities
- Special offers and promotions
- Community highlights and success stories

Stay connected with Campus Connect, your trusted marketplace for student life.

Questions? Contact us at campusconnectcapstone@gmail.com

Best regards,
The Campus Connect Team

${process.env.NEXT_PUBLIC_BASE_URL}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Campus Connect</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0ea5e9; padding: 30px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Welcome to Campus Connect</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                        Thank you for subscribing to the Campus Connect Newsletter!
                      </p>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                        You are now part of our community and will receive updates about:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 25px 0;">
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                            New features and platform improvements
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                            Campus events and activities
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                            Special offers and promotions
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #475569; font-size: 15px;">
                            Community highlights and success stories
                          </td>
                        </tr>
                      </table>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; margin: 0 0 30px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.6;">
                              <strong>Stay connected with Campus Connect</strong><br/>
                              Your trusted marketplace for student life.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 30px 0;">
                        Questions? Contact us at 
                        <a href="mailto:campusconnectcapstone@gmail.com" style="color: #0ea5e9; text-decoration: none;">campusconnectcapstone@gmail.com</a>
                      </p>
                      
                      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 20px 0;" />
                      
                      <p style="color: #666666; font-size: 13px; line-height: 1.5; margin: 0;">
                        Best regards,<br/>
                        <strong>The Campus Connect Team</strong>
                      </p>
                      
                      <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 10px 0 0 0;">
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

    try {
      await sgMail.send(msg)
    } catch (sendError: any) {
      console.error('SendGrid send error:', sendError)
      
      // Handle SendGrid specific errors
      if (sendError.response) {
        console.error('SendGrid error details:', sendError.response.body)
        const errorMessage = sendError.response.body?.errors?.[0]?.message || 'Failed to send email'
        return NextResponse.json(
          { error: `Email service error: ${errorMessage}` },
          { status: 500 }
        )
      }
      
      throw sendError
    }

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    
    // Provide more specific error messages
    if (error.message) {
      return NextResponse.json(
        { error: `Failed to subscribe: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}
