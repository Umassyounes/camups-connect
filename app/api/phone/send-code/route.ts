import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

// POST /api/phone/send-code - Send verification code
export async function POST(req: NextRequest) {
  console.log('📱 Phone verification endpoint called');
  
  try {
    console.log('🔐 Checking authentication...');
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) {
      console.log('❌ Auth failed, returning response');
      return authResult;
    }
    const { user } = authResult;
    console.log('✅ User authenticated:', user.id);

    console.log('📝 Parsing request body...');
    const body = await req.json();
    const schema = z.object({
      phone: z.string().min(10, 'Phone number too short').max(15, 'Phone number too long'),
    });

    const { phone } = schema.parse(body);
    console.log('📞 Phone number received:', phone);

    // Strip all non-digits and normalize
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Validate US phone number (10 digits, or 11 with leading 1)
    let normalizedPhone: string;
    if (digitsOnly.length === 10) {
      normalizedPhone = `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      normalizedPhone = `+${digitsOnly}`;
    } else {
      return NextResponse.json({ 
        error: 'Invalid phone number. Please enter a valid 10-digit US phone number.',
        hint: 'Format: (555) 123-4567 or 5551234567'
      }, { status: 400 });
    }
    console.log('📞 Normalized phone:', normalizedPhone);

    const supabase = await sbServer();

    console.log('👤 Fetching user profile...');
    // Get user's profile - use maybeSingle instead of single to handle missing profiles
    let { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('id, phone, phoneVerified')
  .eq('supabaseId', user.supabaseId)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      
      // Check if it's a column missing error (SQL migration not run)
      if (profileError.message?.includes('phoneVerified') || profileError.code === '42703') {
        return NextResponse.json({ 
          error: 'Phone verification not set up. Please run the SQL migration first.',
          hint: 'Run supabase-phone-verification.sql in your Supabase SQL Editor'
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: 'Database error: ' + profileError.message }, { status: 500 });
    }

    // Auto-create profile if it doesn't exist
    if (!profile) {
      console.log('🔧 Profile not found, creating one...');
      
      // Get user info from Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const email = authUser?.email || 'user@example.com';
      const name = authUser?.user_metadata?.name || 
                   authUser?.user_metadata?.full_name ||
                   email.split('@')[0];

      // Use service role client to bypass RLS for profile creation
      const { createClient } = await import('@supabase/supabase-js');
      const serviceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: newProfile, error: createError } = await serviceRoleClient
        .from('Profile')
        .insert({
          supabaseId: user.id,
          name: name,
          avatarUrl: authUser?.user_metadata?.avatar_url || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select('id, phone, phoneVerified')
        .single();

      if (createError) {
        console.error('❌ Profile creation failed:', createError);
        return NextResponse.json({ 
          error: 'Failed to create profile: ' + createError.message 
        }, { status: 500 });
      }

      profile = newProfile;
      console.log('✅ Profile created:', profile.id);
    } else {
      console.log('✅ Profile found:', profile.id);
    }

    // Check if this phone is already verified by another user
    const { data: existingPhone } = await supabase
      .from('Profile')
      .select('id, phoneVerified')
      .eq('phone', normalizedPhone)
      .eq('phoneVerified', true)
      .neq('id', profile.id)
      .single();

    if (existingPhone) {
      return NextResponse.json({ 
        error: 'This phone number is already verified by another account' 
      }, { status: 400 });
    }

    // Generate 6-digit code and send via Twilio Verify API
    try {
      console.log('📨 Sending verification code via Twilio Verify...');
      console.log('🔑 Twilio env check:', {
        hasSID: !!process.env.TWILIO_ACCOUNT_SID,
        hasToken: !!process.env.TWILIO_AUTH_TOKEN,
        hasServiceSID: !!process.env.TWILIO_VERIFY_SERVICE_SID,
        SID: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...'
      });
      
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
        console.error('❌ Twilio credentials not configured');
        return NextResponse.json({ 
          error: 'Phone verification is temporarily unavailable. Please contact support.',
        }, { status: 503 });
      }

      // Use Twilio Verify API
      const twilio = require('twilio');
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({
          to: normalizedPhone,
          channel: 'sms'
        });

      console.log(`✅ Twilio Verify SMS sent to ${normalizedPhone}, status: ${verification.status}`);

      // Store the pending phone number for verification (NOT as verified phone yet)
      // The actual phone field will only be updated when code is verified
      const { createClient } = await import('@supabase/supabase-js');
      const serviceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Store pending phone in verification fields only - don't update main phone field
      await serviceRoleClient
        .from('Profile')
        .update({
          phoneVerificationCode: normalizedPhone, // Store pending phone here temporarily
          phoneVerificationExpiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          // Don't update 'phone' field - that only happens on successful verification
        })
        .eq('id', profile.id);

      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent to your phone!' 
      });
    } catch (twilioError: any) {
      console.error('Twilio Verify error:', twilioError);
      
      // Return error - don't save phone number on failure
      return NextResponse.json({ 
        error: 'Failed to send verification code. Please check your phone number and try again.',
        details: twilioError.message || 'SMS service error'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/phone/send-code:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid phone number. Use format: +1234567890 or 1234567890', 
        details: error.issues 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
