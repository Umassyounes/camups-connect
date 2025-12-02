"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Event = {
  id: number
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string | null
  location: string
  imageUrl: string | null
  capacity: number | null
  category: string | null
  organizer: {
    id: number
    name: string | null
    avatarUrl: string | null
    createdAt: string
  }
  attendees: Array<{
    user: {
      id: number
      name: string | null
      avatarUrl: string | null
    }
  }>
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    params.then(p => {
      setEventId(p.id)
      fetchEvent(p.id)
    })
    fetchCurrentUser()
  }, [params])

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (data.data) {
        setCurrentUserId(data.data.id)
        setIsAdmin(data.data.role === 'ADMIN' || data.data.role === 'MODERATOR')
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    }
  }

  async function fetchEvent(id: string) {
    try {
      const res = await fetch(`/api/events/${id}`)
      const data = await res.json()
      
      if (data.data) {
        setEvent(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRSVP() {
    if (!eventId || !currentUserId) {
      router.push("/login")
      return
    }

    const isAttending = event?.attendees.some(a => a.user.id === currentUserId)
    
    setRsvpLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isAttending ? "cancel" : "rsvp"
        })
      })

      if (res.ok) {
        // Refresh event data
        if (eventId) {
          fetchEvent(eventId)
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to process RSVP")
      }
    } catch (error) {
      console.error("RSVP failed:", error)
      alert("Failed to process RSVP")
    } finally {
      setRsvpLoading(false)
    }
  }

  async function handleDelete() {
    if (!eventId) return
    
    const confirmed = confirm("Are you sure you want to delete this event? This action cannot be undone.")
    if (!confirmed) return

    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        alert("Event deleted successfully!")
        router.push("/events")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Delete failed:", error)
      alert("Failed to delete event")
    } finally {
      setDeleteLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-foreground-secondary">Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12 text-foreground-secondary">
        <p className="text-lg text-foreground">Event not found</p>
        <Link href="/events" className="text-primary hover:underline mt-4 inline-block">
          ← Back to Events
        </Link>
      </div>
    )
  }

  const isAttending = event.attendees.some(a => a.user.id === currentUserId)
  const isOrganizer = event.organizer.id === currentUserId
  const canManageEvent = isOrganizer || isAdmin
  const spotsLeft = event.capacity ? event.capacity - event.attendees.length : null
  const isFull = event.capacity && event.attendees.length >= event.capacity

  return (
    <div className="mx-auto max-w-4xl px-3 md:px-6 pb-20 md:pb-6">
      <Link href="/events" className="text-primary hover:underline mb-3 md:mb-4 inline-block text-sm md:text-base">
        ← Back to Events
      </Link>

  <div className="rounded-xl border border-border bg-[var(--card-bg)] overflow-hidden shadow-subtle">
        {/* Event Image */}
  <div className="aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-[rgba(129,140,248,0.35)] via-[rgba(14,21,33,0.7)] to-[rgba(14,116,144,0.4)] relative">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl md:text-9xl">
              📅
            </div>
          )}
          {event.category && (
            <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-white shadow-lg text-xs md:text-base">
              {event.category}
            </span>
          )}
        </div>

        {/* Event Details */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 text-foreground">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{event.title}</h1>
            <p className="text-sm md:text-base text-foreground-secondary whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-border">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">📅</span>
                <div>
                  <p className="font-semibold text-sm md:text-base">Date</p>
                  <p className="text-xs md:text-sm text-foreground-secondary">{formatDate(event.eventDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">🕐</span>
                <div>
                  <p className="font-semibold text-sm md:text-base">Time</p>
                  <p className="text-xs md:text-sm text-foreground-secondary">
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">📍</span>
                <div>
                  <p className="font-semibold text-sm md:text-base">Location</p>
                  <p className="text-xs md:text-sm text-foreground-secondary">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">👥</span>
                <div>
                  <p className="font-semibold text-sm md:text-base">Attendees</p>
                  <p className="text-xs md:text-sm text-foreground-secondary">
                    {event.attendees.length} attending
                    {event.capacity && ` (${spotsLeft} spots left)`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">👤</span>
                <div>
                  <p className="font-semibold text-sm md:text-base">Organizer</p>
                  <p className="text-xs md:text-sm text-foreground-secondary">
                    {event.organizer.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    Member since {new Date(event.organizer.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 md:pt-4 border-t border-border space-y-2 md:space-y-3">
            {canManageEvent && (
              <div className="text-center py-2 md:py-3 rounded-lg bg-[rgba(129,140,248,0.15)]">
                <p className="text-sm md:text-base text-primary font-medium">
                  {isOrganizer ? "You are the organizer of this event" : "Admin Access"}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {/* RSVP Button */}
              {!canManageEvent && (
                <button
                  onClick={handleRSVP}
                  disabled={rsvpLoading || (!!isFull && !isAttending)}
                  className={`flex-1 py-2.5 md:py-3 rounded-lg font-medium transition shadow-subtle disabled:opacity-50 text-sm md:text-base ${
                    isFull && !isAttending
                      ? "bg-[rgba(100,116,139,0.2)] text-foreground-secondary cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {rsvpLoading
                    ? "Processing..."
                    : isFull && !isAttending
                    ? "Event Full"
                    : isAttending
                    ? "✓ Cancel RSVP"
                    : "RSVP to Event"}
                </button>
              )}
              
              {/* Edit and Delete Buttons - For organizer and admins */}
              {canManageEvent && (
                <>
                  <button
                    onClick={() => router.push(`/events/${eventId}/edit`)}
                    className="flex-1 py-2.5 md:py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-subtle text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">✏️ Edit Event</span>
                    <span className="sm:hidden">✏️ Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 py-2.5 md:py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 shadow-subtle text-sm md:text-base"
                  >
                    {deleteLoading ? "Deleting..." : (
                      <>
                        <span className="hidden sm:inline">🗑️ Delete Event</span>
                        <span className="sm:hidden">🗑️ Delete</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Attendees List */}
          {event.attendees.length > 0 && (
            <div className="pt-3 md:pt-4 border-t border-border">
              <h3 className="font-semibold mb-2 md:mb-3 text-sm md:text-base text-foreground">Attendees ({event.attendees.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 text-foreground">
                {event.attendees.map((attendee) => (
                  <div
                    key={attendee.user.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border bg-[var(--background-secondary)]"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[rgba(129,140,248,0.18)] flex items-center justify-center text-primary font-bold flex-shrink-0 text-xs md:text-sm">
                      {(attendee.user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs md:text-sm truncate">
                      {attendee.user.name || "User"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
