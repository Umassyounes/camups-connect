import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/phone/reset - Reset phone verification (for testing)
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    // Use service role to bypass RLS
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

    // Reset phone verification fields
    const { error } = await serviceRoleClient
      .from('Profile')
      .update({
        phone: null,
        phoneVerified: false,
        phoneVerifiedAt: null,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      })
      .eq('supabaseId', user.supabaseId);

    if (error) {
      console.error('Error resetting phone:', error);
      return NextResponse.json({ error: 'Failed to reset phone verification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Phone verification reset! You can now test again.' 
    });
  } catch (error) {
    console.error('Error in POST /api/phone/reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
