import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"

const BOOST_PRICE_CENTS = 100
const BOOST_DURATION_HOURS = 24
const FREE_MONTHLY_BOOST_LIMIT = 3

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function getMonthBoundaries() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startOfMonth, endOfMonth }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const { id } = await params
  const listingId = Number(id)
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
  }

  const supabase = await sbServer()

  const { data: listing, error: listingError } = await supabase
    .from('Listing')
    .select('id, sellerId, isSold, boostedUntil')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (listing.sellerId !== user.id) {
    return NextResponse.json({ error: 'You can only boost your own listings' }, { status: 403 })
  }

  if (listing.isSold) {
    return NextResponse.json({ error: 'You cannot boost a sold listing' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('Profile')
    .select('id, isPro, proUnlimitedBoosts')
    .eq('id', user.id)
    .single()

  const isPro = Boolean(profile?.isPro)
  const hasUnlimitedBoosts = Boolean(profile?.proUnlimitedBoosts)

  // Check boost usage for free users
  if (!isPro && !hasUnlimitedBoosts) {
    const { startOfMonth, endOfMonth } = getMonthBoundaries()
    
    const { count, error: countError } = await supabase
      .from('ListingBoost')
      .select('id', { count: 'exact', head: true })
      .eq('userId', user.id)
      .gte('createdAt', startOfMonth.toISOString())
      .lte('createdAt', endOfMonth.toISOString())

    if (countError) {
      console.error('Failed to count boosts', countError)
      return NextResponse.json({ error: 'Failed to check boost eligibility' }, { status: 500 })
    }

    const boostCount = count ?? 0
    
    if (boostCount >= FREE_MONTHLY_BOOST_LIMIT) {
      return NextResponse.json({ 
        error: `Free users are limited to ${FREE_MONTHLY_BOOST_LIMIT} boosts per month. Upgrade to Pro for unlimited boosts!`,
        code: 'BOOST_LIMIT_REACHED',
        limit: FREE_MONTHLY_BOOST_LIMIT,
        used: boostCount,
        upgradePath: '/profile#pro-membership'
      }, { status: 403 })
    }
  }

  const now = new Date()
  const activeUntil = listing.boostedUntil ? new Date(listing.boostedUntil) : null
  const baseline = activeUntil && activeUntil > now ? activeUntil : now
  const newEndsAt = addHours(baseline, BOOST_DURATION_HOURS)
  const startsAt = baseline <= now ? now : baseline

  const { error: boostError } = await supabase
    .from('ListingBoost')
    .insert({
      listingId,
      userId: user.id,
      priceCents: isPro ? 0 : BOOST_PRICE_CENTS,
      source: isPro ? 'pro_perk' : 'manual',
      status: 'paid',
      startsAt: startsAt.toISOString(),
      endsAt: newEndsAt.toISOString(),
      metadata: {
        durationHours: BOOST_DURATION_HOURS,
        triggeredAt: now.toISOString(),
      },
    })

  if (boostError) {
    console.error('Failed to record boost', boostError)
    return NextResponse.json({ error: 'Failed to boost listing' }, { status: 500 })
  }

  const { data: updatedListing, error: updateError } = await supabase
    .from('Listing')
    .update({
      boostedUntil: newEndsAt.toISOString(),
      boostedByPro: isPro,
      updatedAt: now.toISOString(),
    })
    .eq('id', listingId)
    .select('id, boostedUntil, boostedByPro')
    .single()

  if (updateError) {
    console.error('Failed to update listing boost window', updateError)
    return NextResponse.json({ error: 'Boost saved but listing failed to update' }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      listing: updatedListing,
      boostedUntil: updatedListing.boostedUntil,
      boostedByPro: updatedListing.boostedByPro,
      priceCents: isPro ? 0 : BOOST_PRICE_CENTS,
      durationHours: BOOST_DURATION_HOURS,
    },
  })
}
