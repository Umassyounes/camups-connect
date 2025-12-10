import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth, optionalAuth } from "@/lib/auth-middleware"
import { canModifyEvent, assertOwnership, AuthorizationError } from "@/lib/authorization"
import { validateRequest, updateEventSchema } from "@/lib/validation-schemas"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/events/[id] - Get event details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting for reads
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:read:id")
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.LENIENT)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }
    
    const supabase = await sbServer()
    const { data: event, error } = await supabase
      .from('Event')
      .select(`
        *,
        organizer:Profile!Event_organizerId_fkey(id, name, avatarUrl, createdAt),
        attendees:EventAttendee(
          userId,
          user:Profile!EventAttendee_userId_fkey(id, name, avatarUrl)
        )
      `)
      .eq('id', eventId)
      .single()
    
    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: event,
    })
  } catch (error) {
    console.error("GET /api/events/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// POST /api/events/[id] - RSVP to event
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Authentication required for RSVP
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:rsvp", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.MODERATE)
    if (rateLimitResponse) return rateLimitResponse
    
    const { id } = await params
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }
    
    const body = await req.json()
    const { action } = body // "rsvp" or "cancel"
    
    const supabase = await sbServer()
    
    if (action === "rsvp") {
      // Check if user already RSVPed
      const { data: existing } = await supabase
        .from('EventAttendee')
        .select('userId')
        .eq('eventId', eventId)
        .eq('userId', user.id)
        .single()
      
      if (existing) {
        return NextResponse.json({ error: "Already RSVPed" }, { status: 400 })
      }
      
      // Check capacity
      const { data: event, error: eventError } = await supabase
        .from('Event')
        .select(`
          capacity,
          attendees:EventAttendee(userId)
        `)
        .eq('id', eventId)
        .single()
      
      if (eventError || !event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      
      if (event.capacity && event.attendees && event.attendees.length >= event.capacity) {
        return NextResponse.json({ error: "Event is at capacity" }, { status: 400 })
      }
      
      // Create RSVP
      const { error: rsvpError } = await supabase
        .from('EventAttendee')
        .insert({
          eventId,
          userId: user.id
        })
      
      if (rsvpError) {
        console.error("RSVP error:", rsvpError)
        return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 })
      }
      
      return NextResponse.json({ message: "RSVP successful" })
    } else if (action === "cancel") {
      // Cancel RSVP
      const { error: cancelError } = await supabase
        .from('EventAttendee')
        .delete()
        .eq('eventId', eventId)
        .eq('userId', user.id)
      
      if (cancelError) {
        console.error("Cancel RSVP error:", cancelError)
        return NextResponse.json({ error: "Failed to cancel RSVP" }, { status: 500 })
      }
      
      return NextResponse.json({ message: "RSVP cancelled" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("POST /api/events/[id] error:", error)
    return NextResponse.json({ error: "Failed to process RSVP" }, { status: 500 })
  }
}

// PATCH /api/events/[id] - Update event (organizer or admin/moderator)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // Authentication
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { id } = await params
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:update", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.STRICT)
    if (rateLimitResponse) return rateLimitResponse

    const supabase = await sbServer()

    // Check if user is admin or moderator
    const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('supabaseId', user.supabaseId)
      .single()

    const userRole = profile?.role?.toUpperCase()
    const isAdminOrModerator = userRole === 'ADMIN' || userRole === 'MODERATOR'

    // Authorization - verify ownership OR admin/moderator status
    const canModify = await canModifyEvent(user.id, eventId)
    
    if (!canModify && !isAdminOrModerator) {
      return NextResponse.json({ error: 'Only the organizer or admin can edit this event' }, { status: 403 })
    }

    // Validation
    const validation = await validateRequest(req, updateEventSchema)
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      )
    }

    const { title, description, startTime, endTime, location, imageUrl, capacity, category } = validation.data

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (capacity !== undefined) updateData.capacity = capacity
    if (category !== undefined) updateData.category = category
    
    if (startTime !== undefined) {
      const eventDate = new Date(startTime)
      if (eventDate < new Date()) {
        return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 })
      }
      updateData.eventDate = eventDate.toISOString()
      updateData.startTime = startTime
    }
    
    if (endTime !== undefined) updateData.endTime = endTime

    // For admin updates, use service role to bypass RLS
    let updateClient = supabase
    if (!canModify && isAdminOrModerator) {
      console.log('🔓 Using service role for admin event update')
      const { createClient } = await import('@supabase/supabase-js')
      updateClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    const { data: updatedEvent, error } = await updateClient
      .from('Event')
      .update(updateData)
      .eq('id', eventId)
      .select(`
        *,
        organizer:Profile!Event_organizerId_fkey(id, name, avatarUrl)
      `)
      .single()

    if (error || !updatedEvent) {
      console.error("PATCH /api/events/[id] error:", error)
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
    }

    return NextResponse.json({ data: updatedEvent })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: 'Only the organizer can edit this event' }, { status: 403 })
    }
    console.error("PATCH /api/events/[id] error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (organizer or admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Authentication
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { id } = await params
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:delete", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.STRICT)
    if (rateLimitResponse) return rateLimitResponse

    const supabase = await sbServer()

    // Check if user is admin or moderator
    const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('supabaseId', user.supabaseId)
      .single()

    const userRole = profile?.role?.toUpperCase()
    const isAdminOrModerator = userRole === 'ADMIN' || userRole === 'MODERATOR'

    // Authorization - verify ownership OR admin/moderator status
    const canModify = await canModifyEvent(user.id, eventId)
    
    if (!canModify && !isAdminOrModerator) {
      return NextResponse.json({ error: 'Only the organizer or admin can delete this event' }, { status: 403 })
    }

    // For admin deletions, use service role to bypass RLS
    let deleteClient = supabase
    if (!canModify && isAdminOrModerator) {
      console.log('🔓 Using service role for admin event deletion')
      const { createClient } = await import('@supabase/supabase-js')
      deleteClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    // Delete the event (cascade will delete attendees)
    const { error } = await deleteClient
      .from('Event')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error("DELETE /api/events/[id] error:", error)
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: 'Only the organizer can delete this event' }, { status: 403 })
    }
    console.error("DELETE /api/events/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
