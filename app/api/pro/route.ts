import { NextRequest, NextResponse } from "next/server"
import { sbServer } from '../../../lib/supabase/server'
import { requireAuth } from '../../../lib/auth-middleware'
import { PRO_PLANS, PRO_PLAN_PRICE_CENTS, DEFAULT_PRO_STATUS, type ProPlanType } from '@/lib/types/pro'
import { isProfilePro, withDerivedProFlag } from '@/lib/utils/pro'

function addMonths(date: Date, months: number) {
  const clone = new Date(date)
  clone.setMonth(clone.getMonth() + months)
  return clone
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const supabase = await sbServer()
  const { data: profile } = await supabase
    .from('Profile')
    .select(`
      id,
      proStatus,
      proPlan,
      proActivatedAt,
      proRenewalDate,
      proAutoRenew,
      proHomepageEligible,
      proUnlimitedBoosts,
      proFeaturedCredits,
      proBoostCredits
    `)
    .eq('supabaseId', user.supabaseId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: subscription } = await supabase
    .from('ProSubscription')
    .select('*')
    .eq('userId', profile.id)
    .order('currentPeriodEnd', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    data: {
      profile: withDerivedProFlag(profile),
      subscription,
      plans: PRO_PLANS,
    },
  })
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const supabase = await sbServer()
  const { data: profile, error: profileError } = await supabase
    .from('Profile')
    .select('*')
    .eq('supabaseId', user.supabaseId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 })
  }

  const action = body.action as 'subscribe' | 'cancel'
  const plan: ProPlanType = 'pro_monthly'

  if (action === 'subscribe') {
    if (isProfilePro(profile) && profile.proStatus === 'active') {
      return NextResponse.json({ error: 'You already have an active Pro subscription.' }, { status: 400 })
    }

    const now = new Date()
    const nextPeriod = addMonths(now, 1)

    const { data: subscription, error: subError } = await supabase
      .from('ProSubscription')
      .insert({
        userId: profile.id,
        plan,
        status: 'active',
        provider: 'manual',
        priceCents: PRO_PLAN_PRICE_CENTS,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: nextPeriod.toISOString(),
        cancelAtPeriodEnd: false,
      })
      .select('*')
      .single()

    if (subError) {
      console.error('Failed to create subscription', subError)
      return NextResponse.json({ error: 'Failed to start subscription' }, { status: 500 })
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('Profile')
      .update({
        proStatus: 'active',
        proPlan: plan,
        proActivatedAt: now.toISOString(),
        proRenewalDate: nextPeriod.toISOString(),
        proAutoRenew: true,
        proHomepageEligible: true,
        proUnlimitedBoosts: true,
        proFeaturedCredits: 3,
        proBoostCredits: 0,
      })
      .eq('id', profile.id)
      .select('*')
      .single()

    if (updateError || !updatedProfile) {
      console.error('Failed to update profile after subscription', updateError)
      return NextResponse.json({ error: 'Subscription created but profile failed to update' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        profile: withDerivedProFlag(updatedProfile),
        subscription,
        plans: PRO_PLANS,
      },
    })
  }

  if (action === 'cancel') {
    if (!isProfilePro(profile) || profile.proStatus === 'none') {
      return NextResponse.json({ error: 'You do not have an active subscription.' }, { status: 400 })
    }

    const { data: sub } = await supabase
      .from('ProSubscription')
      .select('*')
      .eq('userId', profile.id)
      .order('currentPeriodEnd', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      await supabase
        .from('ProSubscription')
        .update({
          status: 'cancelled',
          cancelAtPeriodEnd: true,
          canceledAt: new Date().toISOString(),
        })
        .eq('id', sub.id)
    }

    const { data: updatedProfile } = await supabase
      .from('Profile')
      .update({
        proStatus: 'cancelled',
        proPlan: null,
        proAutoRenew: false,
        proHomepageEligible: false,
        proUnlimitedBoosts: false,
        proFeaturedCredits: 0,
        proBoostCredits: 0,
      })
      .eq('id', profile.id)
      .select('*')
      .single()

    return NextResponse.json({
      data: {
        profile: withDerivedProFlag(updatedProfile ?? { ...profile, ...DEFAULT_PRO_STATUS }),
        subscription: sub,
        plans: PRO_PLANS,
      },
    })
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
}
