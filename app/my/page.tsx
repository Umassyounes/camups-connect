"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import ListingCard from "@/components/ListingCard"
import type { Database } from "@/lib/supabase/databaseTypes"

type ListingRow = Database['public']['Tables']['Listing']['Row']
type CategoryRow = Database['public']['Tables']['Category']['Row']
type ListingWithCategory = ListingRow & {
  category?: CategoryRow | null
  seller?: {
    id: number
    name: string | null
  }
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "sold">("all")

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return
      
      const profileData = await res.json()
      const userId = profileData.data?.id
      
      if (!userId) return

      const listingsRes = await fetch('/api/listings?limit=100')
      const listingsData = await listingsRes.json()
      
      const myListings = listingsData.data.filter((l: any) => l.seller.id === userId)
      setListings(myListings)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filter === "active") return !listing.isSold
    if (filter === "sold") return listing.isSold
    return true
  })

  const activeCount = listings.filter(l => !l.isSold).length
  const soldCount = listings.filter(l => l.isSold).length

  return (
    <main className="min-h-screen pb-20 bg-[#F5F7FA]">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A202C] mb-1">
                📦 My Listings
              </h1>
              <p className="text-sm md:text-base text-[#718096]">
                Manage and track all your marketplace posts
              </p>
            </div>
            <Link 
              href="/listings/new"
              className="inline-flex items-center justify-center gap-2 bg-[#4F7CFF] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold hover:bg-[#3D6AE8] transition-all shadow-md hover:shadow-lg text-sm md:text-base"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Listing
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-[#1A202C]">{listings.length}</div>
            <div className="text-xs md:text-sm text-[#718096]">Total Listings</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-xs md:text-sm text-[#718096]">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-[#4F7CFF]">{soldCount}</div>
            <div className="text-xs md:text-sm text-[#718096]">Sold</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 md:gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all whitespace-nowrap text-sm md:text-base ${
              filter === "all"
                ? "bg-[#1A202C] text-white shadow-md"
                : "bg-white text-[#718096] hover:bg-gray-50 border border-gray-200"
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all whitespace-nowrap text-sm md:text-base ${
              filter === "active"
                ? "bg-green-600 text-white shadow-md"
                : "bg-white text-[#718096] hover:bg-gray-50 border border-gray-200"
            }`}
          >
            🟢 Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter("sold")}
            className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full font-medium transition-all whitespace-nowrap text-sm md:text-base ${
              filter === "sold"
                ? "bg-[#4F7CFF] text-white shadow-md"
                : "bg-white text-[#718096] hover:bg-gray-50 border border-gray-200"
            }`}
          >
            ✓ Sold ({soldCount})
          </button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#4F7CFF] mb-4"></div>
            <p className="text-[#718096]">Loading your listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
            <div className="text-6xl md:text-7xl mb-4">📦</div>
            <h3 className="text-xl md:text-2xl font-bold text-[#1A202C] mb-2">
              {filter === "all" ? "No listings yet" : `No ${filter} listings`}
            </h3>
            <p className="text-sm md:text-base text-[#718096] mb-6 max-w-md mx-auto">
              {filter === "all" 
                ? "Start selling by creating your first listing. It only takes a minute!"
                : filter === "active"
                ? "You don't have any active listings right now."
                : "You haven't sold any items yet. Keep at it!"}
            </p>
            {filter === "all" && (
              <Link 
                href="/listings/new"
                className="inline-flex items-center gap-2 bg-[#4F7CFF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#3D6AE8] transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="animate-fade-in">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
