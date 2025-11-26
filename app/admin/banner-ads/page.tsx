"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type BannerAd = {
  id: number
  sponsorName: string
  headline: string
  body: string
  ctaLabel: string
  ctaUrl: string
  startsAt: string
  endsAt: string
  status: 'scheduled' | 'active' | 'expired'
  priceCents: number
  createdAt: string
}

export default function AdminBannerAdsPage() {
  const [ads, setAds] = useState<BannerAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchAds()
  }, [])

  async function fetchAds() {
    try {
      const res = await fetch('/api/admin/banner-ads')
      if (res.ok) {
        const data = await res.json()
        setAds(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch banner ads:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success'
      case 'scheduled': return 'bg-primary/10 text-primary border-primary'
      case 'expired': return 'bg-foreground-secondary/10 text-foreground-secondary border-border'
      default: return 'bg-foreground-secondary/10 text-foreground-secondary border-border'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading banner ads...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Banner Ad Management</h1>
          <p className="text-foreground-secondary mt-1">
            Manage sponsored banner placements across the marketplace
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition font-medium"
        >
          + New Banner Ad
        </button>
      </div>

      {/* Mock data since we don't have a real table yet */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Example banner ad entries */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Fuel finals week with Beacon Pizza</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor('active')}`}>
                    Active
                  </span>
                </div>
                <p className="text-sm text-foreground-secondary mb-2">
                  UMass students get 20% off large pies + free delivery to campus housing when you mention Campus Connect.
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                  <span>Sponsor: Beacon Pizza Co.</span>
                  <span>•</span>
                  <span>$25.00 / week</span>
                  <span>•</span>
                  <span>Ends: {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 border border-border rounded-lg hover:bg-[var(--background-elevated)] transition">
                  Edit
                </button>
                <button className="text-xs px-3 py-1 border border-error text-error rounded-lg hover:bg-error/10 transition">
                  Deactivate
                </button>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-3 opacity-60">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">Student Housing Special</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor('scheduled')}`}>
                    Scheduled
                  </span>
                </div>
                <p className="text-sm text-foreground-secondary mb-2">
                  Move-in ready apartments near campus. First month free for students!
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                  <span>Sponsor: Campus Housing LLC</span>
                  <span>•</span>
                  <span>$48.00 / month</span>
                  <span>•</span>
                  <span>Starts: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 border border-border rounded-lg hover:bg-[var(--background-elevated)] transition">
                  Edit
                </button>
                <button className="text-xs px-3 py-1 border border-error text-error rounded-lg hover:bg-error/10 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12 text-foreground-secondary">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-lg mb-2">No banner ads yet</p>
            <p className="text-sm">Create your first banner ad to start monetizing the marketplace</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <strong>🚧 Demo Mode:</strong> This is a placeholder admin interface. In production, this would connect to a 
          BannerAd database table with full CRUD operations, rotation logic, and analytics tracking.
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/admin"
          className="text-primary hover:underline text-sm"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  )
}
