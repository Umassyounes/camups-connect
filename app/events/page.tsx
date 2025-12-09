"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import SearchBar from "@/components/SearchBar"

type Event = {
  id: number
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string | null
  location: string
  imageUrl: string | null
  category: string | null
  attendeeCount: number
  isExternal: boolean
  externalSource: string | null
  isSponsored: boolean
  sponsoredBadge: string | null
  sponsoredPriority: number | null
  sponsoredUntil: string | null
  sponsoredSlot?: {
    id: number
    status: 'pending_payment' | 'scheduled' | 'active' | 'expired' | 'cancelled'
    tier: string
    sponsorName: string
    promoUrl: string | null
    startsAt: string
    endsAt: string
  } | null
  organizer: {
    id: number
    name: string | null
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming">("upcoming")
  const [sourceFilter, setSourceFilter] = useState<"all" | "community" | "official">("all")
  const [sponsoredFilter, setSponsoredFilter] = useState<"all" | "sponsored" | "standard">("all")
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null)

  useEffect(() => {
    fetchEvents()
    fetchCurrentUser()
  }, [filter])

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (data.data) {
        setCurrentUserId(data.data.id)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  // Filter events by source
  const filteredEvents = events
    .filter(event => {
      if (sourceFilter === "all") return true
      if (sourceFilter === "official") return event.isExternal
      if (sourceFilter === "community") return !event.isExternal
      return true
    })
    .filter(event => {
      if (sponsoredFilter === "all") return true
      if (sponsoredFilter === "sponsored") return event.isSponsored
      return !event.isSponsored
    })

  const sponsoredEvents = filteredEvents.filter(event => event.isSponsored)
  const organicEvents = filteredEvents.filter(event => !event.isSponsored)

  async function fetchEvents() {
    try {
      const params = new URLSearchParams()
      if (filter === "upcoming") {
        params.append("upcoming", "true")
      }
      
      const res = await fetch(`/api/events?${params}`)
      const data = await res.json()
      
      if (data.data) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  function formatTime(time: string) {
    // Handle both ISO timestamp strings and HH:MM format
    let date: Date
    
    if (time.includes('T') || time.includes('Z')) {
      // It's an ISO timestamp
      date = new Date(time)
    } else {
      // It's just a time string like "14:30"
      const [hours, minutes] = time.split(":")
      date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
    }
    
    // Format to 12-hour time
    return date.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  function renderEventCard(event: Event) {
    const isOrganizer = event.organizer.id === currentUserId
    const cardClasses = event.isSponsored
      ? "border-2 border-amber-400/60 shadow-[0_10px_35px_rgba(251,191,36,0.25)]"
      : "border border-border shadow-subtle"

    return (
      <div key={event.id} className="relative group">
        <Link
          href={`/events/${event.id}`}
          className={`block rounded-xl ${cardClasses} bg-[var(--card-bg)] overflow-hidden hover:shadow-float transition`}
        >
          {/* Event Image */}
          <div className="aspect-video bg-gradient-to-br from-[rgba(129,140,248,0.35)] via-[rgba(14,21,33,0.65)] to-[rgba(14,116,144,0.4)] relative overflow-hidden">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                {event.isExternal ? '🏛️' : '📅'}
              </div>
            )}
            <div className="absolute top-2 left-2 flex flex-wrap gap-2">
              {event.isSponsored && (
                <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-subtle">
                  {event.sponsoredBadge || 'Sponsored'}
                </span>
              )}
            </div>
            <div className="absolute top-2 right-2 flex gap-2">
              {event.isExternal && (
                <span className="bg-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-subtle">
                  🏛️ Official UMass
                </span>
              )}
              {event.category && !event.isExternal && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-subtle">
                  {event.category}
                </span>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition">
              {event.title}
            </h3>

            <p className="text-sm text-foreground-secondary line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-1 text-sm pt-2">
              <div className="flex items-center gap-2 text-foreground-secondary">
                <span>📅</span>
                <span>{formatDate(event.eventDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-foreground-secondary">
                <span>🕐</span>
                <span>
                  {formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-foreground-secondary">
                <span>📍</span>
                <span className="line-clamp-1">{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-foreground-secondary pt-1">
                <span>👥</span>
                <span>{event.attendeeCount} attending</span>
              </div>

              {event.isSponsored && event.sponsoredUntil && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <span>✨</span>
                  <span>Featured through {formatDate(event.sponsoredUntil)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border text-xs text-foreground-secondary">
              {event.isExternal ? (
                <div className="flex items-center justify-between">
                  <span>Official UMass Boston Event</span>
                  {event.externalSource && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (event.externalSource) {
                          window.open(event.externalSource, '_blank', 'noopener,noreferrer')
                        }
                      }}
                      className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              ) : (
                <span>Organized by {event.organizer.name || "Anonymous"}</span>
              )}
            </div>

            {event.isSponsored && event.sponsoredSlot && (
              <div className="mt-3 rounded-lg border border-amber-400/40 bg-[rgba(251,191,36,0.12)] p-3 text-xs text-amber-800 flex flex-col gap-1">
                <span className="font-semibold">Sponsored by {event.sponsoredSlot.sponsorName}</span>
                {event.sponsoredSlot.promoUrl && (
                  <button
                    className="text-amber-900 underline text-left"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const promoUrl = event.sponsoredSlot?.promoUrl
                      if (promoUrl) {
                        window.open(promoUrl, '_blank', 'noopener,noreferrer')
                      }
                    }}
                  >
                    Visit partner site →
                  </button>
                )}
              </div>
            )}
          </div>
        </Link>

        {isOrganizer && !event.isExternal && (
          <button
            onClick={(e) => handleDeleteEvent(event.id, event.title, e)}
            disabled={deletingEventId === event.id}
            className="absolute top-2 left-2 bg-error text-white px-3 py-1 rounded-lg text-xs font-medium shadow-subtle opacity-0 group-hover:opacity-100 transition hover:opacity-90 disabled:opacity-50 z-10"
            title="Delete event"
          >
            {deletingEventId === event.id ? "Deleting..." : "🗑️ Delete"}
          </button>
        )}
      </div>
    )
  }

  async function handleDeleteEvent(eventId: number, eventTitle: string, e: React.MouseEvent) {
    e.preventDefault() // Prevent navigation to event detail page
    e.stopPropagation()
    
    const confirmed = confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingEventId(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        // Remove event from local state
        setEvents(events.filter(e => e.id !== eventId))
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Failed to delete event")
    } finally {
      setDeletingEventId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 md:px-6 pb-20 md:pb-6">
      {/* Header with Search */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">UMB Events</h1>
            <p className="mt-1 text-sm md:text-base text-foreground-secondary">Discover and join campus events</p>
          </div>
        </div>

        {/* Sponsor Banner - Coming Soon */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8 text-center">
        <p className="text-sm md:text-base text-gray-600 font-medium">📢 Sponsored Events Coming Soon</p>
      </div>
        
        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {/* Filters - Simplified to 2 main filters */}
      <div className="mb-4 md:mb-6 flex gap-2 md:gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap ${
            filter === "upcoming"
              ? "border border-primary bg-primary/15 text-primary shadow-subtle"
              : "border border-border bg-[var(--background-secondary)] text-foreground-secondary hover:text-foreground"
          }`}
        >
          📅 Upcoming Events
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap ${
            filter === "all"
              ? "border border-primary bg-primary/15 text-primary shadow-subtle"
              : "border border-border bg-[var(--background-secondary)] text-foreground-secondary hover:text-foreground"
          }`}
        >
          🗓️ All Events
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12 text-foreground-secondary">
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-border text-foreground-secondary shadow-subtle">
          <p className="text-base md:text-lg text-foreground">No events found</p>
          <p className="text-sm mt-2">
            {sourceFilter === "official" 
              ? "Try syncing UMass Boston events or check back later"
              : "Be the first to create an event!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {sponsoredEvents.length > 0 && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground">Sponsored spotlights</h2>
                  <p className="text-xs md:text-sm text-foreground-secondary">Clubs and local partners promoting upcoming moments.</p>
                </div>
                <Link href="/events/new" className="text-primary text-xs md:text-sm hover:underline whitespace-nowrap">
                  Promote your event →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {sponsoredEvents.map(renderEventCard)}
              </div>
            </section>
          )}

          {organicEvents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {organicEvents.map(renderEventCard)}
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl border border-dashed border-border text-foreground-secondary">
              <p className="text-sm md:text-base text-foreground">Only sponsored events match this view right now.</p>
              <p className="text-xs md:text-sm mt-2">Adjust filters to see more campus events.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
