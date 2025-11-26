import type { Database } from '@/lib/supabase/databaseTypes'

export type EventRow = Database['public']['Tables']['Event']['Row']
export type SponsoredEventStatus = 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'

export type SponsoredEventSlot = {
  id: number
  eventId: number
  sponsorUserId: number | null
  sponsorName: string
  contactEmail: string | null
  contactPhone: string | null
  promoUrl: string | null
  priceCents: number
  tier: string
  status: SponsoredEventStatus
  startsAt: string
  endsAt: string
  approvedBy: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export const SPONSORED_EVENT_TIERS = {
  spotlight: {
    key: 'spotlight',
    label: 'Spotlight Sponsor',
    priceCents: 2500,
    durationHours: 96,
    badge: '🌟 Spotlight Sponsor',
    priority: 100,
  },
  featured: {
    key: 'featured',
    label: 'Featured Sponsor',
    priceCents: 1500,
    durationHours: 72,
    badge: '⭐ Featured Sponsor',
    priority: 75,
  },
  community: {
    key: 'community',
    label: 'Community Sponsor',
    priceCents: 800,
    durationHours: 48,
    badge: '✨ Community Sponsor',
    priority: 50,
  },
} as const

export type SponsoredEventTier = keyof typeof SPONSORED_EVENT_TIERS

export const SPONSORED_EVENT_STATUS_META: Record<
  SponsoredEventStatus,
  { label: string; color: string; description: string }
> = {
  pending_payment: {
    label: 'Payment Pending',
    color: 'border-border text-foreground-secondary bg-warning/10',
    description: 'Requested slot awaiting payment confirmation.',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'border-border text-foreground bg-primary/10',
    description: 'Payment received — countdown to go-live.',
  },
  active: {
    label: 'Active',
    color: 'border-success text-success bg-success/10',
    description: 'Currently featured to students.',
  },
  expired: {
    label: 'Expired',
    color: 'border-border text-foreground-secondary bg-[rgba(148,163,184,0.1)]',
    description: 'Slot ended. Renew or upgrade anytime.',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'border-error text-error bg-error/10',
    description: 'Cancelled by organizer or moderation.',
  },
}

export function isEventCurrentlySponsored(event: { isSponsored?: boolean; sponsoredUntil?: string | null }) {
  if (!event.isSponsored || !event.sponsoredUntil) return false
  return new Date(event.sponsoredUntil).getTime() > Date.now()
}

export function getSponsorshipTierMeta(tier: string | null | undefined) {
  if (!tier) return null
  const normalized = tier.toLowerCase() as SponsoredEventTier
  return SPONSORED_EVENT_TIERS[normalized] ?? null
}

export {}
