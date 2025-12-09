"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageCarousel from "@/components/ImageCarousel"
import VerifiedBadge from "@/components/VerifiedBadge"
import ReportButton from "@/components/ReportButton"

export const dynamic = "force-dynamic"
export const dynamicParams = true

type Listing = {
  id: number
  title: string
  description: string
  priceCents: number
  condition: string
  imageUrl: string | null
  images: string[]
  imageCount: number
  campus: string | null
  isSold: boolean
  createdAt: string
  updatedAt: string
  boostedUntil?: string | null
  boostedByPro?: boolean
  category: { id: number; name: string } | null
  seller: {
    id: number
    name: string | null
    avatarUrl: string | null
    createdAt: string
    isVerified: boolean
    isPro?: boolean
  }
}

type PageProps = { params: Promise<{ id: string }> }

export default function ListingDetailPage({ params }: PageProps) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [listingId, setListingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    params.then((p) => setListingId(p.id))
  }, [params])

  useEffect(() => {
    if (!listingId) return
    async function fetchData() {
      try {
        const listingRes = await fetch(`/api/listings/${listingId}`)
        if (!listingRes.ok) {
          setLoading(false)
          return
        }
        const listingData = await listingRes.json()
        setListing(listingData.data)

        const profileRes = await fetch("/api/profile")
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setCurrentUserId(profileData.data?.id || null)
          setIsAdmin(profileData.data?.isAdmin || false)
        }
      } catch (error) {
        console.error("Failed to fetch listing:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [listingId, router])

  async function handleMarkAsSold() {
    if (!listing || !confirm("Mark this listing as sold?")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSold: true }),
      })
      if (res.ok) {
        const data = await res.json()
        setListing(data.data)
        alert("Listing marked as sold!")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to mark as sold")
      }
    } catch (error) {
      console.error("Failed to mark as sold:", error)
      alert("Failed to mark as sold")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!listing || !confirm("Are you sure you want to delete this listing? This cannot be undone.")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" })
      if (res.ok) {
        alert("Listing deleted successfully!")
        window.location.href = "/"
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete listing")
        setActionLoading(false)
      }
    } catch (error) {
      console.error("Failed to delete listing:", error)
      alert("Failed to delete listing")
      setActionLoading(false)
    }
  }

  async function handleMessageSeller() {
    if (!listing) return
    setActionLoading(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", listing.seller.id.toString())
      const res = await fetch("/api/conversations/create", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        if (data.redirect) router.push(data.redirect)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to create conversation")
      }
    } catch (error) {
      console.error("Failed to create conversation:", error)
      alert("Failed to create conversation")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mb-4"></div>
          <p className="text-foreground-secondary">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-foreground-secondary mb-4">Listing not found</p>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const isOwnListing = currentUserId === listing.seller.id
  const price = `$${(listing.priceCents / 100).toFixed(2)}`
  const sellerName = listing.seller.name || "Anonymous"
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date())
  const boostedUntilDisplay = listing.boostedUntil ? new Date(listing.boostedUntil).toLocaleString() : null
  const displayImages = listing.images && listing.images.length > 0 ? listing.images : listing.imageUrl ? [listing.imageUrl] : []

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
      <div className="text-sm text-foreground-secondary mb-3 md:mb-4">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <Link href="/" className="hover:text-primary">Marketplace</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <span className="text-foreground">{listing.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left column */}
        <div className="space-y-4 md:space-y-5">
          <div className="rounded-2xl border border-border bg-[var(--card-bg)] shadow-subtle overflow-hidden">
            <div className="p-4 md:p-6">
              <ImageCarousel images={displayImages} alt={listing.title} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-6">
          <div className="rounded-2xl border border-border bg-[var(--card-bg)] p-4 md:p-6 shadow-subtle">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              {!isOwnListing && <ReportButton contentType="listing" contentId={listing.id} size="sm" />}
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <p className="text-3xl font-bold text-primary">{price}</p>
              {listing.condition && (
                <span className="px-3 py-1 rounded-full bg-[var(--background-secondary)] text-sm font-semibold text-foreground">
                  {listing.condition}
                </span>
              )}
              {listing.category && (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {listing.category.name}
                </span>
              )}
              {isBoosted && (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 bg-orange-500/10 px-3 py-1 rounded-full">
                  Boosted
                  {boostedUntilDisplay && (
                    <span className="text-[11px] font-normal text-orange-600/80">
                      until {new Date(listing.boostedUntil!).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                </span>
              )}
              {listing.isSold && (
                <span className="px-3 py-1 rounded-full bg-error/15 text-error text-sm font-semibold">Sold</span>
              )}
            </div>

            {listing.campus && (
              <div className="flex items-start gap-2 text-sm text-foreground mt-2">
                <span className="text-base">📍</span>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-foreground-secondary">{listing.campus}</p>
                </div>
              </div>
            )}

            <div className="mt-4 border border-dashed border-border rounded-xl p-4 text-sm text-foreground">
              <p className="font-semibold mb-2">Safety Tips</p>
              <ul className="space-y-1 list-disc list-inside text-foreground-secondary">
                <li>Prefer meeting in a public place</li>
                <li>Inspect the item before payment</li>
                <li>Campus Connect does not regulate or handle payments</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-[var(--card-bg)] p-4 md:p-6 shadow-subtle">
            <div className="flex items-center gap-3">
              {listing.seller.avatarUrl ? (
                <img src={listing.seller.avatarUrl} alt={sellerName} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Seller</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{sellerName}</p>
                  <VerifiedBadge isVerified={listing.seller.isVerified} size="sm" />
                </div>
                <p className="text-xs text-foreground-secondary">
                  Member since {new Date(listing.seller.createdAt).getFullYear()}
                </p>
              </div>
            </div>
            {!isOwnListing && !listing.isSold && (
              <div className="mt-3">
                <button
                  onClick={handleMessageSeller}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <span aria-hidden>💬</span>
                  <span>{actionLoading ? "Opening..." : "Message Seller"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full-width description */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[var(--card-bg)] p-4 md:p-6 shadow-subtle">
          <h2 className="font-semibold mb-2 text-lg">Description</h2>
          <p className="text-foreground text-sm md:text-base whitespace-pre-wrap break-words">
            {listing.description}
          </p>
        </div>

        {/* Additional Info */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[var(--card-bg)] p-4 md:p-6 shadow-subtle">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-foreground-secondary">Posted</p>
              <p className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-foreground-secondary">Last Updated</p>
              <p className="font-medium">{new Date(listing.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-foreground-secondary">Listing ID</p>
              <p className="font-medium">#{listing.id}</p>
            </div>
            <div>
              <p className="text-foreground-secondary">Status</p>
              <p className="font-medium">{listing.isSold ? "Sold" : "Available"}</p>
            </div>
          </div>
        </div>

        {/* Actions (owner/admin) */}
        <div className="lg:col-span-2 space-y-4">
          {isOwnListing && (
            <div className="rounded-2xl border border-border bg-[var(--card-bg)] p-4 md:p-6 shadow-subtle space-y-3">
              <p className="text-sm text-foreground-secondary font-medium">This is your listing</p>
              <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                {!listing.isSold && (
                  <button
                    onClick={handleMarkAsSold}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50 shadow-lg"
                  >
                    {actionLoading ? "Processing..." : "Mark as Sold"}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-bold disabled:opacity-50 shadow-lg"
                >
                  {actionLoading ? "Deleting..." : "Delete Listing"}
                </button>
              </div>
            </div>
          )}

          {!isOwnListing && isAdmin && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 md:p-5 shadow-subtle space-y-2">
              <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Admin Actions</p>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 shadow-subtle"
              >
                {actionLoading ? "Deleting..." : "Admin: Delete Listing"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
