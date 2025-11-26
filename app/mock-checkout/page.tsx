/**
 * Mock Checkout Page - Simulates Stripe Checkout
 * For demo/class project only - no real payment processing
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MockCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [processing, setProcessing] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Simulate payment processing with countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          processPayment()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const processPayment = async () => {
    setProcessing(true)

    try {
      // Simulate payment success
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Activate Pro subscription via API
      const response = await fetch('/api/stripe/mock-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        router.push('/profile?pro_success=true')
      } else {
        router.push('/profile?pro_cancelled=true')
      }
    } catch (error) {
      console.error('Mock payment error:', error)
      router.push('/profile?pro_cancelled=true')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        {/* Mock Stripe Logo */}
        <div className="mb-6">
          <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-xl font-bold">
            DEMO CHECKOUT
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Campus Connect Pro
        </h1>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-300">Monthly Subscription</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">$4.99</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-left mt-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Pro Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Featured Listings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Unlimited Boosts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Priority Support</span>
            </div>
          </div>
        </div>

        {/* Mock Processing Animation */}
        <div className="space-y-4">
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Processing payment...</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Activating Pro subscription in {countdown}...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                (This is a demo - no real payment is being processed)
              </p>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🎓 <strong>Class Project Demo Mode</strong><br />
            No personal information or payment details required
          </p>
        </div>
      </div>
    </div>
  )
}
