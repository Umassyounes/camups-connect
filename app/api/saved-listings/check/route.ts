import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"

// GET /api/saved-listings/check?listingId=123 - Check if a listing is saved
export async function GET(req: NextRequest) {
  try {
    // Authentication required
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "saved-listings:check", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.LENIENT)
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const supabase = await sbServer()

    const { data: savedListing, error } = await supabase
      .from('SavedListing')
      .select('id')
      .eq('userId', user.id)
      .eq('listingId', parseInt(listingId))
      .maybeSingle()

    if (error) {
      console.error("GET /api/saved-listings/check error:", error)
      return NextResponse.json({ error: "Failed to check saved status" }, { status: 500 })
    }

    return NextResponse.json({ 
      isSaved: !!savedListing
    })
  } catch (error) {
    console.error("GET /api/saved-listings/check error:", error)
    return NextResponse.json({ error: "Failed to check saved status" }, { status: 500 })
  }
}
