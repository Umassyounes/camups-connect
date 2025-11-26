// lib/types/pro.ts
// Minimal pro-related types and constants used by the app.

export type ProPlanType = 'pro_monthly' | 'pro_yearly'

export const PRO_PLAN_PRICE_CENTS = 999

export const PRO_PLANS = [
  { id: 'pro_monthly' as ProPlanType, name: 'Pro Monthly', priceCents: PRO_PLAN_PRICE_CENTS },
  { id: 'pro_yearly' as ProPlanType, name: 'Pro Yearly', priceCents: PRO_PLAN_PRICE_CENTS * 10 },
]

export const DEFAULT_PRO_STATUS = {
  isPro: false,
  proStatus: 'none',
  proPlan: null,
}
