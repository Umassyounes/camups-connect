import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"

// GET /api/saved-listings - Get all saved listings for current user
export async function GET(req: NextRequest) {
  try {
    // Authentication required
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "saved-listings:read", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.MODERATE)
    if (rateLimitResponse) return rateLimitResponse

    const supabase = await sbServer()

    // Get saved listings with full listing details
    const { data: savedListings, error } = await supabase
      .from('SavedListing')
      .select(`
        id,
        createdAt,
        listing:Listing(
          id,
          title,
          description,
          priceCents,
          condition,
          imageUrl,
          images,
          imageCount,
          campus,
          isSold,
          sellerId,
          categoryId,
          createdAt,
          updatedAt,
          boostedUntil,
          boostedByPro,
          category:Category(id, name, slug),
          seller:Profile!Listing_sellerId_fkey(id, name, avatarUrl)
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error("GET /api/saved-listings error:", error)
      return NextResponse.json({ error: "Failed to fetch saved listings" }, { status: 500 })
    }

    // Transform to flatten the listing data
    const listings = (savedListings || [])
      .filter((item: any) => item.listing !== null)
      .map((item: any) => ({
        savedId: item.id,
        savedAt: item.createdAt,
        ...item.listing
      }))

    return NextResponse.json({ data: listings })
  } catch (error) {
    console.error("GET /api/saved-listings error:", error)
    return NextResponse.json({ error: "Failed to fetch saved listings" }, { status: 500 })
  }
}

// POST /api/saved-listings - Save a listing
export async function POST(req: NextRequest) {
  try {
    // Authentication required
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting - moderate to prevent spam saving
    const rateLimitIdentifier = getRateLimitIdentifier(req, "saved-listings:save", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.MODERATE)
    if (rateLimitResponse) return rateLimitResponse

    const body = await req.json().catch(() => null)
    const listingId = body?.listingId

    if (!listingId || typeof listingId !== 'number') {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const supabase = await sbServer()

    // Check if listing exists and is not sold
    const { data: listing, error: listingError } = await supabase
      .from('Listing')
      .select('id, sellerId')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Don't allow users to save their own listings
    if (listing.sellerId === user.id) {
      return NextResponse.json({ error: "You cannot save your own listing" }, { status: 400 })
    }

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('SavedListing')
      .select('id')
      .eq('userId', user.id)
      .eq('listingId', listingId)
      .single()

    if (existingSave) {
      return NextResponse.json({ error: "Listing already saved", alreadySaved: true }, { status: 400 })
    }

    // Save the listing
    const { data: savedListing, error } = await supabase
      .from('SavedListing')
      .insert({
        userId: user.id,
        listingId: listingId,
        createdAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("POST /api/saved-listings error:", error)
      return NextResponse.json({ error: "Failed to save listing" }, { status: 500 })
    }

    return NextResponse.json({ 
      data: savedListing,
      message: "Listing saved successfully" 
    })
  } catch (error) {
    console.error("POST /api/saved-listings error:", error)
    return NextResponse.json({ error: "Failed to save listing" }, { status: 500 })
  }
}

// DELETE /api/saved-listings - Unsave a listing
export async function DELETE(req: NextRequest) {
  try {
    // Authentication required
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "saved-listings:unsave", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.MODERATE)
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    if (!listingId || isNaN(parseInt(listingId))) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 })
    }

    const supabase = await sbServer()

    // Delete the saved listing
    const { error } = await supabase
      .from('SavedListing')
      .delete()
      .eq('userId', user.id)
      .eq('listingId', parseInt(listingId))

    if (error) {
      console.error("DELETE /api/saved-listings error:", error)
      return NextResponse.json({ error: "Failed to unsave listing" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Listing unsaved successfully" 
    })
  } catch (error) {
    console.error("DELETE /api/saved-listings error:", error)
    return NextResponse.json({ error: "Failed to unsave listing" }, { status: 500 })
  }
}
