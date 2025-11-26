"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type BoostUsageData = {
  used: number
  limit: number
  isPro: boolean
  hasUnlimited: boolean
}

export default function BoostUsageIndicator() {
  const [usage, setUsage] = useState<BoostUsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  async function fetchUsage() {
    try {
      const res = await fetch('/api/boost-usage')
      if (res.ok) {
        const data = await res.json()
        setUsage(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch boost usage', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usage) return null

  if (usage.isPro || usage.hasUnlimited) {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
        <span className="text-base">✨</span>
        <span>Unlimited boosts</span>
      </div>
    )
  }

  const remaining = usage.limit - usage.used
  const isLow = remaining <= 1
  const isExhausted = remaining === 0

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
      isExhausted 
        ? 'bg-error/10 text-error' 
        : isLow 
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'bg-[var(--background-secondary)] text-foreground-secondary'
    }`}>
      <span className="font-bold">{remaining}/{usage.limit}</span>
      <span>boosts left this month</span>
      {isExhausted && (
        <Link 
          href="/profile#pro-membership" 
          className="ml-1 underline font-semibold hover:text-error-dark transition"
        >
          Upgrade
        </Link>
      )}
    </div>
  )
}
