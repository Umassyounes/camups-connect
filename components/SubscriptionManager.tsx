'use client'

import { useState } from 'react'

interface SubscriptionManagerProps {
  proStatus: string
  proActivatedAt?: string | null
  proRenewalDate?: string | null
  provider?: string
}

export default function SubscriptionManager({
  proStatus,
  proActivatedAt,
  proRenewalDate,
  provider
}: SubscriptionManagerProps) {
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = async () => {
    setCancelling(true)

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Subscription cancelled successfully')
        window.location.reload()
      } else {
        alert(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel subscription')
    } finally {
      setCancelling(false)
      setShowConfirm(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDemoMode = provider === 'mock_demo' || provider === 'admin_grant'
  const providerLabel = provider ? provider.replace(/_/g, ' ') : 'Stripe'

  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl shadow-[0_20px_45px_rgba(99,102,241,0.45)]">
            ✨
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current Plan</p>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Pro Membership
              {proStatus === 'active' && (
                <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
                  Active
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500">Premium visibility + trust indicators</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Price</p>
          <p className="text-2xl font-black text-slate-900">
            $4.99<span className="text-base font-semibold text-slate-500">/mo</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["Pro Badge", "Featured Listings", "Unlimited Boosts", "Priority Support"].map((perk) => (
          <span
            key={perk}
            className="rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-700"
          >
            {perk}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Member Since</p>
          <p className="text-base font-semibold text-slate-900">{formatDate(proActivatedAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Renews</p>
          <p className="text-base font-semibold text-slate-900">{formatDate(proRenewalDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Provider</p>
          <p className="text-base font-semibold text-slate-900">{providerLabel}</p>
        </div>
      </div>

      {isDemoMode && (
        <div className="mt-4 rounded-2xl border border-sky-200/70 bg-sky-50/60 px-4 py-3 text-center text-xs font-semibold text-sky-700">
          🎓 Demo Mode — mock subscription active for presentation
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Cancel Subscription
        </button>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-600">
            Are you sure? You'll lose all Pro features immediately.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(248,113,113,0.35)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={cancelling}
              className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Keep Pro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
