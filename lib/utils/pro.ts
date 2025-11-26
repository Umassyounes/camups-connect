import type { Database } from '@/lib/supabase/databaseTypes'

export type PartialProProfile = Partial<Pick<Database['public']['Tables']['Profile']['Row'],
  'proStatus' | 'proPlan' | 'proHomepageEligible' | 'proUnlimitedBoosts'
>>

const ACTIVE_PRO_STATUSES: Array<Database['public']['Tables']['Profile']['Row']['proStatus']> = [
  'active',
  'grace',
  'past_due',
]

export function isProfilePro(profile?: PartialProProfile | null): boolean {
  if (!profile) return false
  if (profile.proHomepageEligible || profile.proUnlimitedBoosts) return true
  if (profile.proPlan) return true
  if (!profile.proStatus) return false
  return ACTIVE_PRO_STATUSES.includes(profile.proStatus)
}

export function withDerivedProFlag<T extends Record<string, any> | null | undefined>(profile: T) {
  if (!profile) return profile ?? null
  return { ...profile, isPro: isProfilePro(profile as PartialProProfile) }
}
