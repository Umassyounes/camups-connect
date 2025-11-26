import { NextRequest, NextResponse } from 'next/server'
import { sbServer } from '../../../lib/supabase/server'
import type { 
  PaymentMethod, 
  PaymentMethodInsert,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput 
} from '../../../lib/types/payment'

/**
 * GET /api/payment-methods
 * Get all payment methods for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await sbServer()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('Profile')
      .select('id')
      .eq('supabaseId', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get all payment methods for this user
    const { data: paymentMethods, error } = await supabase
      .from('PaymentMethod')
      .select('*')
      .eq('userId', profile.id)
      .order('isPreferred', { ascending: false })
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching payment methods:', error)
      return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
    }

    return NextResponse.json({ data: paymentMethods })
  } catch (error) {
    console.error('Unexpected error in GET /api/payment-methods:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/payment-methods
 * Create a new payment method for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await sbServer()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile ID
    const { data: profile } = await supabase
      .from('Profile')
      .select('id')
      .eq('supabaseId', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body: CreatePaymentMethodInput = await req.json()
    const { methodType, paymentHandle, displayName, notes, isPreferred } = body

    // Validate required fields
    if (!methodType || !['venmo', 'cashapp', 'zelle', 'cash'].includes(methodType)) {
      return NextResponse.json({ error: 'Invalid payment method type' }, { status: 400 })
    }

    // Validate payment handle (required for all except cash)
    if (methodType !== 'cash' && !paymentHandle?.trim()) {
      return NextResponse.json({ 
        error: `Payment handle is required for ${methodType}` 
      }, { status: 400 })
    }

    // Cash method should not have a payment handle
    if (methodType === 'cash' && paymentHandle) {
      return NextResponse.json({ 
        error: 'Cash payment method should not have a payment handle' 
      }, { status: 400 })
    }

    // Check if user already has this payment method type with same handle
    const { data: existing } = await supabase
      .from('PaymentMethod')
      .select('id')
      .eq('userId', profile.id)
      .eq('methodType', methodType)
      .eq('paymentHandle', methodType === 'cash' ? null : paymentHandle?.trim())
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'You already have this payment method added' 
      }, { status: 400 })
    }

    // Create the payment method
    const insertData: PaymentMethodInsert = {
      userId: profile.id,
      methodType,
      paymentHandle: methodType === 'cash' ? null : paymentHandle?.trim() || null,
      displayName: displayName?.trim() || null,
      notes: notes?.trim() || null,
      isActive: true,
      isPreferred: isPreferred || false,
    }

    const { data: paymentMethod, error } = await supabase
      .from('PaymentMethod')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating payment method:', error)
      return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 })
    }

    return NextResponse.json({ data: paymentMethod }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/payment-methods:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
