# Sponsored Campus Events

Enable clubs and local partners to spotlight time-sensitive happenings directly in the campus feed. This guide covers the schema, APIs, and UI controls added in this update.

## 1. Database setup

1. Run the new `supabase-sponsored-events.sql` migration (or re-run via Supabase SQL editor) after pulling these changes:
   - Adds `SponsoredEventSlot` table plus `sponsored_event_status` enum.
   - Extends the `Event` table with `isSponsored`, `sponsoredSlotId`, `sponsoredBadge`, `sponsoredPriority`, and `sponsoredUntil`.
   - Applies RLS policies so event organizers (or the sponsor account) can create/read/update their slot requests.
2. Re-generate local types (if you consume the Supabase schema) so `Database['public']['Tables']['SponsoredEventSlot']` is available.

> ℹ️  Existing policies were wrapped in idempotent guards so the migration can be re-applied safely.

## 2. API surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/events` | GET | Returns events sorted with active sponsorships first. Accepts `?sponsoredOnly=true` to filter down to featured cards. Response now includes `isSponsored`, `sponsoredUntil`, and nested `sponsoredSlot` metadata. |
| `/api/events` | POST | Unchanged creation endpoint; organizers still create base events here. |
| `/api/events/[id]` | GET | Returns detailed event payload plus `sponsoredSlot` info and normalized `isSponsored` flag. |
| `/api/events/[id]/sponsor` | POST | **New**. Authenticated organizers (or partner accounts) can request a sponsored slot by selecting a tier, contact details, and optional promo URL. Creates a `SponsoredEventSlot` row and updates the host event’s highlighted metadata. |

Server-side helpers in `lib/types/events.ts` centralize tier definitions, durations, and status labels.

## 3. UI behaviors

- **Events feed (`/events`)**
  - Sponsored events now render with a gold frame, badge, and "Sponsored spotlights" carousel at the top of the page.
  - Filter chips include a new "✨ Sponsored" toggle to quickly view only featured content.
- **Event detail (`/events/[id]`)**
  - Visitors see the sponsor badge, status chip, and promo link for active slots.
  - Organizers get a "Promote this event" panel with tier cards, contact form, and submission button wired to `/api/events/[id]/sponsor`.

## 4. Operational tips

- Sponsorship requests currently activate immediately after submission (future scheduling UI displays a "coming soon" message if a far-future date is chosen).
- All payments remain manual for now; once collected, you can manually update `SponsoredEventSlot.status` if needed.
- Expiration relies on the stored `endsAt` timestamp—cron or background workers can periodically clear `Event.isSponsored` when `sponsoredUntil` is in the past.

## 5. Testing checklist

1. `npm install` (if dependencies changed) and `npx tsc --noEmit` to confirm types.
2. Create a fresh event, open its detail page as the organizer, and request a sponsorship tier.
3. Verify the event jumps into the sponsored carousel on `/events` and the detail page shows the sponsor card.
4. Attempt to request a second slot while one is pending—API should reject with a 400 response.

Refer back to this guide whenever you need to update tiers, messaging, or approval logic.
