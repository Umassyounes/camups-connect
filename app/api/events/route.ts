import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { validateRequest, createEventSchema } from "@/lib/validation-schemas"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"

// GET /api/events - List all events
export async function GET(req: NextRequest) {
  try {
    // Rate limiting for public reads
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:read")
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.LENIENT)
    if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const upcoming = searchParams.get("upcoming") === "true"
  const sponsoredOnly = searchParams.get("sponsoredOnly") === "true"
    
    const supabase = await sbServer()
    let query = supabase
      .from('Event')
      .select(`
        *,
        organizer:Profile!Event_organizerId_fkey(id, name, avatarUrl),
        attendees:EventAttendee(userId)
      `)
      .order('eventDate', { ascending: true })
      .limit(100)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (upcoming) {
      query = query.gte('eventDate', new Date().toISOString())
    }
    
    const { data: events, error } = await query
    
    if (error) {
      console.error("GET /api/events error:", error)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }
    
    const eventsWithCount = (events || []).map((event: any) => ({
      ...event,
      attendeeCount: event.attendees?.length || 0,
    }))
    
    return NextResponse.json({ data: eventsWithCount })
  } catch (error) {
    console.error("GET /api/events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST /api/events - Create new event
export async function POST(req: NextRequest) {
  try {
    // Authentication
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting - strict for event creation
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:create", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.STRICT)
    if (rateLimitResponse) return rateLimitResponse

    // Validation
    const validation = await validateRequest(req, createEventSchema)
    if ('error' in validation) {
      console.error("Event validation failed:", validation.details?.issues)
      return NextResponse.json(
        { error: validation.error, details: validation.details?.issues },
        { status: 400 }
      )
    }

    const { title, description, startTime, endTime, location, imageUrl, capacity, category } = validation.data

    // Parse the ISO datetime string
    const eventDate = new Date(startTime)
    
    // Ensure event is not in the past (allow a 5-minute buffer for form submission time)
    const now = new Date()
    now.setMinutes(now.getMinutes() - 5) // Allow 5 minute grace period
    if (eventDate < now) {
      return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 })
    }
    
    const supabase = await sbServer()
    const nowISO = new Date().toISOString()
    
    const { data: event, error } = await supabase
      .from('Event')
      .insert({
        title,
        description,
        eventDate: startTime, // Already in ISO format from frontend
        startTime: startTime, // Already in ISO format from frontend
        endTime: endTime || null, // Already in ISO format from frontend
        location: location || "",
        imageUrl: imageUrl || null,
        capacity: capacity || null,
        category: category || null,
        organizerId: user.id,
        createdAt: nowISO,
        updatedAt: nowISO
      })
      .select(`
        *,
        organizer:Profile!Event_organizerId_fkey(id, name, avatarUrl)
      `)
      .single()
    
    if (error || !event) {
      console.error("POST /api/events error:", error)
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }
    
    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    console.error("POST /api/events error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
