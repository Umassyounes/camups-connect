// global.d.ts
// Minimal ambient module declarations so imports like '@/lib/...' resolve to `any`.
// These unblock the TypeScript server when the real types are not present.
declare module "@/lib/*"
declare module "@/*"

declare module "@/lib/types/pro" {
	export type ProPlanType = any
	export const PRO_PLANS: any
	export const PRO_PLAN_PRICE_CENTS: number
	export const DEFAULT_PRO_STATUS: any
}

declare module "@/lib/types/payment" {
	export type PaymentMethod = any
	export type PaymentMethodDisplay = any
	export type CreatePaymentMethodInput = any
	export type UpdatePaymentMethodInput = any
	export const PAYMENT_METHOD_INFO: any
}

declare module "@/lib/supabase/server" {
	export const sbServer: any
}

declare module "@/lib/auth-middleware" {
	export function requireAuth(...args: any[]): any
	export function optionalAuth(...args: any[]): any
	export function requireFullAdmin(...args: any[]): any
	export type AuthenticatedUser = any
}

