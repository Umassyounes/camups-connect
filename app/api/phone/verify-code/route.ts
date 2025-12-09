import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

// POST /api/phone/verify-code - Verify the code
export async function POST(req: NextRequest) {
  try {
    console.log('📱 Verify code endpoint called');
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    console.log('✅ User authenticated:', user.id);

    const body = await req.json();
    const schema = z.object({
      code: z.string().length(6, 'Verification code must be 6 digits'),
    });

    const { code } = schema.parse(body);
    console.log('🔢 Code received:', code);

    const supabase = await sbServer();

    // Get user's profile with verification code
    const { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('id, phone, phoneVerificationCode, phoneVerificationExpiry, phoneVerified')
  .eq('supabaseId', user.supabaseId)
      .single();

    console.log('👤 Profile data:', JSON.stringify(profile, null, 2));
    console.log('❓ Profile error:', profileError);

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if already verified
    if (profile.phoneVerified && profile.phone) {
      return NextResponse.json({ 
        success: true,
        message: 'Phone number already verified!',
        alreadyVerified: true 
      });
    }

    // Get the pending phone number from phoneVerificationCode field
    // (We store it there temporarily until verification succeeds)
    const pendingPhone = profile.phoneVerificationCode;
    
    if (!pendingPhone || !pendingPhone.startsWith('+')) {
      return NextResponse.json({ 
        error: 'No pending phone verification. Please request a verification code first.' 
      }, { status: 400 });
    }

    // Check if verification request expired
    if (profile.phoneVerificationExpiry && new Date(profile.phoneVerificationExpiry) < new Date()) {
      return NextResponse.json({ 
        error: 'Verification request expired. Please request a new code.' 
      }, { status: 400 });
    }

    // Try Twilio Verify API
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) {
      try {
        console.log('🔐 Verifying code with Twilio Verify API...');
        console.log('📞 Checking code for phone:', pendingPhone);
        const twilio = require('twilio');
        const twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks
          .create({
            to: pendingPhone,
            code: code
          });

        console.log('✅ Twilio Verify check result:', verificationCheck.status);

        if (verificationCheck.status !== 'approved') {
          return NextResponse.json({ 
            error: 'Invalid verification code. Please try again.' 
          }, { status: 400 });
        }

        // ✅ Code verified by Twilio! Save phone and mark as verified
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

        const { error: updateError } = await serviceRoleClient
          .from('Profile')
          .update({
            phone: pendingPhone, // NOW we save the verified phone number
            phoneVerified: true,
            phoneVerifiedAt: new Date().toISOString(),
            phoneVerificationCode: null,
            phoneVerificationExpiry: null,
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error('Error verifying phone:', updateError);
          return NextResponse.json({ error: 'Failed to verify phone number' }, { status: 500 });
        }

        console.log(`✅ Phone verified for user ${profile.id}: ${pendingPhone}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Phone number verified successfully! 🎉',
          verified: true 
        });
      } catch (twilioError: any) {
        console.error('❌ Twilio Verify error:', twilioError);
        return NextResponse.json({ 
          error: 'Failed to verify code. Please try again.',
          details: twilioError.message
        }, { status: 400 });
      }
    }

    // No Twilio configured - return error
    return NextResponse.json({ 
      error: 'Phone verification service not configured. Please contact support.' 
    }, { status: 503 });
  } catch (error) {
    console.error('Error in POST /api/phone/verify-code:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid verification code format', 
        details: error.issues 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
