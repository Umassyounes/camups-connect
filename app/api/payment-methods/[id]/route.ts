import { NextRequest, NextResponse } from 'next/server'
import { sbServer } from '../../../../lib/supabase/server'
import type { UpdatePaymentMethodInput } from '../../../../lib/types/payment'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/payment-methods/[id]
 * Get a specific payment method
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const paymentMethodId = parseInt(id, 10)

    if (isNaN(paymentMethodId)) {
      return NextResponse.json({ error: 'Invalid payment method ID' }, { status: 400 })
    }

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

    // Get the payment method (RLS ensures user can only see their own)
    const { data: paymentMethod, error } = await supabase
      .from('PaymentMethod')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('userId', profile.id)
      .single()

    if (error || !paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    return NextResponse.json({ data: paymentMethod })
  } catch (error) {
    console.error('Unexpected error in GET /api/payment-methods/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/payment-methods/[id]
 * Update a payment method
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const paymentMethodId = parseInt(id, 10)

    if (isNaN(paymentMethodId)) {
      return NextResponse.json({ error: 'Invalid payment method ID' }, { status: 400 })
    }

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

    // Verify the payment method belongs to the user
    const { data: existing } = await supabase
      .from('PaymentMethod')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('userId', profile.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Parse request body
    const body: UpdatePaymentMethodInput = await req.json()
    const { paymentHandle, displayName, notes, isActive, isPreferred } = body

    // Build update object (only include provided fields)
    const updateData: Partial<UpdatePaymentMethodInput> = {}
    
    if (paymentHandle !== undefined) {
      // Cash method shouldn't have a handle
      if (existing.methodType === 'cash' && paymentHandle) {
        return NextResponse.json({ 
          error: 'Cash payment method cannot have a payment handle' 
        }, { status: 400 })
      }
      // Non-cash methods must have a handle
      if (existing.methodType !== 'cash' && !paymentHandle?.trim()) {
        return NextResponse.json({ 
          error: `Payment handle is required for ${existing.methodType}` 
        }, { status: 400 })
      }
      updateData.paymentHandle = existing.methodType === 'cash' ? null : paymentHandle?.trim() || null
    }

    if (displayName !== undefined) {
      updateData.displayName = displayName?.trim() || null
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (isPreferred !== undefined) {
      updateData.isPreferred = isPreferred
    }

    // Update the payment method
    const { data: paymentMethod, error } = await supabase
      .from('PaymentMethod')
      .update(updateData)
      .eq('id', paymentMethodId)
      .eq('userId', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment method:', error)
      return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
    }

    return NextResponse.json({ data: paymentMethod })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/payment-methods/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const paymentMethodId = parseInt(id, 10)

    if (isNaN(paymentMethodId)) {
      return NextResponse.json({ error: 'Invalid payment method ID' }, { status: 400 })
    }

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

    // Delete the payment method (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from('PaymentMethod')
      .delete()
      .eq('id', paymentMethodId)
      .eq('userId', profile.id)

    if (error) {
      console.error('Error deleting payment method:', error)
      return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Payment method deleted successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/payment-methods/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
