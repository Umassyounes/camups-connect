import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { isProfilePro } from "@/lib/utils/pro"

const FREE_MONTHLY_BOOST_LIMIT = 3

function getMonthBoundaries() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startOfMonth, endOfMonth }
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const supabase = await sbServer()

  const { data: profile } = await supabase
    .from('Profile')
    .select('id, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const isPro = isProfilePro(profile)
  const hasUnlimited = Boolean(profile.proUnlimitedBoosts)

  if (isPro || hasUnlimited) {
    return NextResponse.json({
      data: {
        used: 0,
        limit: Infinity,
        isPro: true,
        hasUnlimited: true,
      },
    })
  }

  const { startOfMonth, endOfMonth } = getMonthBoundaries()

  const { count, error } = await supabase
    .from('ListingBoost')
    .select('id', { count: 'exact', head: true })
    .eq('userId', user.id)
    .gte('createdAt', startOfMonth.toISOString())
    .lte('createdAt', endOfMonth.toISOString())

  if (error) {
    console.error('Failed to count boosts', error)
    return NextResponse.json({ error: 'Failed to fetch boost usage' }, { status: 500 })
  }

  return NextResponse.json({
    data: {
      used: count ?? 0,
      limit: FREE_MONTHLY_BOOST_LIMIT,
      isPro: false,
      hasUnlimited: false,
    },
  })
}
