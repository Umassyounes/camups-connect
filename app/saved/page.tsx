"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import ListingCard from "@/components/ListingCard"

type SavedListing = {
  savedId: number
  savedAt: string
  id: number
  title: string
  description: string
  priceCents: number
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'
  imageUrl: string | null
  images: string[]
  imageCount: number
  campus: string | null
  isSold: boolean
  sellerId: number
  categoryId: number | null
  createdAt: string
  updatedAt: string
  boostedUntil: string | null
  boostedByPro: boolean
  category: { id: number; name: string; slug: string } | null
  seller: { id: number; name: string | null; avatarUrl: string | null }
}

export default function SavedListingsPage() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSavedListings() {
      try {
        const res = await fetch('/api/saved-listings')
        if (res.status === 401) {
          window.location.href = '/login?redirectTo=/saved'
          return
        }
        if (!res.ok) {
          throw new Error('Failed to fetch saved listings')
        }
        const data = await res.json()
        setSavedListings(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchSavedListings()
  }, [])

  async function handleUnsave(listingId: number) {
    try {
      const res = await fetch(`/api/saved-listings?listingId=${listingId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSavedListings(prev => prev.filter(l => l.id !== listingId))
      }
    } catch (err) {
      console.error('Failed to unsave listing:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mb-4"></div>
          <p className="text-foreground-secondary">Loading saved listings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Saved Listings</h1>
        <div className="rounded-lg border bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-50 rounded-xl">
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Saved Listings</h1>
            <p className="text-foreground-secondary text-sm">
              {savedListings.length} {savedListings.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedListings.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card-bg)] rounded-2xl border border-border">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No saved listings yet</h2>
          <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
            When you find listings you like, click the heart icon to save them here for later.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <>
          {/* Listings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {savedListings.map((listing) => (
              <div key={listing.savedId} className="relative group">
                <ListingCard 
                  listing={listing} 
                  showSaveButton={true}
                />
                {listing.isSold && (
                  <button
                    onClick={() => handleUnsave(listing.id)}
                    className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-50 hover:text-red-600 z-30"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Info Banner */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Pro tip</p>
                <p className="text-blue-600">
                  Saved listings stay here even if the seller updates the price. Check back often to see if anything has changed!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
