import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY || ''

if (!secretKey) {
  console.warn('[stripe] STRIPE_SECRET_KEY missing – running in mock mode.')
}

// Initialize Stripe client only when configured
export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null

export const isStripeConfigured = Boolean(secretKey)

// Pro subscription price (monthly)
export const PRO_PRICE = {
  monthly: process.env.STRIPE_PRO_PRICE_ID || '',
}

// Stripe product metadata
export const STRIPE_METADATA = {
  productName: 'Campus Connect Pro',
  productDescription: 'Premium features for Campus Connect marketplace',
}
