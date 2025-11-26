import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { sbServer } from "@/lib/supabase/server"

export const runtime = 'nodejs'

/**
 * Banner Ads Management API
 * 
 * In production, this would connect to a BannerAd table with fields:
 * - id, sponsorName, headline, body, ctaLabel, ctaUrl
 * - startsAt, endsAt, status, priceCents, placement
 * - impressions, clicks, createdAt, updatedAt
 */

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const supabase = await sbServer()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('Profile')
    .select('isAdmin')
    .eq('id', user.id)
    .single()

  if (!profile?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // TODO: Query BannerAd table when it exists
  // const { data: ads } = await supabase
  //   .from('BannerAd')
  //   .select('*')
  //   .order('createdAt', { ascending: false })

  // For now, return empty array
  return NextResponse.json({
    data: [],
    message: 'Banner ad management is in demo mode'
  })
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const supabase = await sbServer()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('Profile')
    .select('isAdmin')
    .eq('id', user.id)
    .single()

  if (!profile?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await req.json()
    
    // TODO: Create banner ad in database
    // const { data: newAd } = await supabase
    //   .from('BannerAd')
    //   .insert({
    //     ...body,
    //     status: 'scheduled'
    //   })
    //   .select()
    //   .single()

    return NextResponse.json({
      data: { id: Date.now(), ...body },
      message: 'Banner ad created (demo mode)'
    })

  } catch (error) {
    console.error('Failed to create banner ad:', error)
    return NextResponse.json({ error: 'Failed to create banner ad' }, { status: 500 })
  }
}
