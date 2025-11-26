'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeToProButtonProps {
  className?: string
}

export default function UpgradeToProButton({ className = '' }: UpgradeToProButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      // Call API to create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to mock checkout page
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start upgrade process')
        setLoading(false)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`
        group relative inline-flex w-full items-center justify-center overflow-hidden
        rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
        px-6 py-3 text-base font-semibold text-white shadow-[0_20px_45px_rgba(99,102,241,0.35)]
        transition-all duration-200 hover:shadow-[0_25px_55px_rgba(147,51,234,0.45)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-white
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
    >
      <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-30"
        style={{ background: 'radial-gradient(circle at top, rgba(255,255,255,0.8), transparent 55%)' }}
      />
      {loading ? (
        <span className="relative z-10 flex items-center gap-2 text-sm uppercase tracking-wide">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="relative z-10 flex flex-col items-center text-center">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/80">Exclusive Access</span>
          <span className="text-lg font-bold leading-tight">Upgrade to Pro • $4.99<span className="text-sm font-medium">/mo</span></span>
        </span>
      )}
    </button>
  )
}
