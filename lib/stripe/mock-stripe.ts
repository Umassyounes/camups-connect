/**
 * MOCK STRIPE PAYMENT SYSTEM - FOR DEMO/CLASS PROJECT ONLY
 * This simulates Stripe functionality without requiring real payment processing
 * Perfect for demonstrations and testing without personal information
 */

// Mock Stripe client (doesn't connect to real Stripe)
export const mockStripe = {
  createCheckoutSession: async (userId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock session
    return {
      sessionId: `mock_session_${userId}_${Date.now()}`,
      url: `/mock-checkout?userId=${userId}`,
      success: true
    }
  },

  processPayment: async (sessionId: string) => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      subscriptionId: `mock_sub_${Date.now()}`,
      customerId: `mock_cus_${Date.now()}`,
      status: 'active'
    }
  },

  cancelSubscription: async (subscriptionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    }
  }
}

// Mock subscription status
export type MockSubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'none'

export interface MockSubscription {
  id: string
  userId: number
  status: MockSubscriptionStatus
  plan: 'pro_monthly'
  amount: number
  createdAt: string
  currentPeriodEnd: string
}
