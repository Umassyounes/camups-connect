import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { sbServer } from "@/lib/supabase/server"
import { validateRequest, sponsoredEventRequestSchema } from "@/lib/validation-schemas"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"
import { SPONSORED_EVENT_TIERS, isEventCurrentlySponsored } from "@/lib/types/events"

const BLOCKING_STATUSES = ['pending_payment', 'scheduled', 'active'] as const

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const rateLimitIdentifier = getRateLimitIdentifier(req, "events:sponsor", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.MODERATE)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const eventId = parseInt(id)
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    const validation = await validateRequest(req, sponsoredEventRequestSchema)
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error, details: validation.details?.issues },
        { status: 400 }
      )
    }

    const { tier, sponsorName, contactEmail, contactPhone, promoUrl, startsAt, notes } = validation.data
    const tierMeta = SPONSORED_EVENT_TIERS[tier]
    if (!tierMeta) {
      return NextResponse.json({ error: "Unsupported sponsorship tier" }, { status: 400 })
    }

    const now = new Date()
    const requestedStart = startsAt ? new Date(startsAt) : now
    if (Number.isNaN(requestedStart.getTime())) {
      return NextResponse.json({ error: "Invalid start time" }, { status: 400 })
    }

    const fiveMinutes = 5 * 60 * 1000
    if (requestedStart.getTime() - now.getTime() > fiveMinutes) {
      return NextResponse.json({ error: "Future scheduling is coming soon — please choose an immediate slot" }, { status: 400 })
    }

    const normalizedStart = requestedStart < now ? now : requestedStart
    const endsAt = new Date(normalizedStart.getTime() + tierMeta.durationHours * 60 * 60 * 1000)
    const status = 'active'

    const supabase = await sbServer()

    const { data: event, error: eventError } = await supabase
      .from('Event')
      .select('id, organizerId, isExternal, isSponsored, sponsoredUntil, sponsoredSlotId')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.isExternal) {
      return NextResponse.json({ error: "Official UMass events cannot be sponsored" }, { status: 400 })
    }

    if (isEventCurrentlySponsored({ isSponsored: event.isSponsored, sponsoredUntil: event.sponsoredUntil })) {
      return NextResponse.json({ error: "Event already has an active sponsorship" }, { status: 400 })
    }

    const { data: existingSlots, error: slotCheckError } = await supabase
      .from('SponsoredEventSlot')
      .select('id, status')
      .eq('eventId', eventId)
      .in('status', [...BLOCKING_STATUSES])
      .limit(1)

    if (slotCheckError) {
      console.error('Failed to check existing sponsored slots', slotCheckError)
      return NextResponse.json({ error: "Failed to review sponsorship status" }, { status: 500 })
    }

    if (existingSlots && existingSlots.length > 0) {
      return NextResponse.json({ error: "Sponsorship request already pending" }, { status: 400 })
    }

    const { data: slot, error: slotError } = await supabase
      .from('SponsoredEventSlot')
      .insert({
        eventId,
        sponsorUserId: user.id,
        sponsorName,
  contactEmail,
  contactPhone: contactPhone || null,
  promoUrl: promoUrl || null,
        priceCents: tierMeta.priceCents,
        tier: tierMeta.key,
        status,
        startsAt: normalizedStart.toISOString(),
        endsAt: endsAt.toISOString(),
        notes: notes || null,
      })
      .select('*')
      .single()

    if (slotError || !slot) {
      console.error('Failed to create sponsored event slot', slotError)
      return NextResponse.json({ error: "Failed to schedule sponsorship" }, { status: 500 })
    }

  const shouldMarkSponsored = status === 'active'

    const { error: eventUpdateError } = await supabase
      .from('Event')
      .update({
        sponsoredSlotId: slot.id,
        isSponsored: shouldMarkSponsored,
        sponsoredBadge: tierMeta.badge,
        sponsoredPriority: shouldMarkSponsored ? tierMeta.priority : null,
        sponsoredUntil: shouldMarkSponsored ? slot.endsAt : null,
      })
      .eq('id', eventId)

    if (eventUpdateError) {
      console.error('Failed to update event with sponsorship metadata', eventUpdateError)
      return NextResponse.json({ error: "Sponsorship saved but event metadata failed" }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: {
          slot,
          event: {
            ...event,
            sponsoredSlotId: slot.id,
            isSponsored: shouldMarkSponsored,
            sponsoredBadge: tierMeta.badge,
            sponsoredPriority: shouldMarkSponsored ? tierMeta.priority : null,
            sponsoredUntil: shouldMarkSponsored ? slot.endsAt : null,
          },
        },
        message: "Sponsorship scheduled",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/events/[id]/sponsor error:", error)
    return NextResponse.json({ error: "Failed to schedule sponsorship" }, { status: 500 })
  }
}
