"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Event = {
  id: number
  title: string
  eventDate: string
  startTime: string
  endTime: string | null
  location: string
  imageUrl: string | null
  category: string | null
  organizer: {
    id: number
    name: string | null
  }
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchMyEvents()
    }
  }, [currentUserId])

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (data?.data?.id) {
        setCurrentUserId(data.data.id)
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    }
  }

  async function fetchMyEvents() {
    setLoading(true)
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      if (Array.isArray(data?.data)) {
        const mine = data.data.filter((ev: Event) => ev.organizer?.id === currentUserId)
        setEvents(mine)
      }
    } catch (error) {
      console.error("Failed to load events:", error)
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
      year: "numeric",
    })
  }

  function formatTime(time: string | null) {
    if (!time) return null
    let date: Date
    if (time.includes("T") || time.includes("Z")) {
      date = new Date(time)
    } else {
      const [h, m] = time.split(":")
      date = new Date()
      date.setHours(parseInt(h), parseInt(m))
    }
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const showLogin = !loading && !currentUserId

  return (
    <main className="min-h-screen bg-[#F5F7FA] pb-16">
      <section className="bg-white border-b border-gray-200 py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.25em] font-semibold text-slate-500">HOSTING</p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Events</h1>
              <p className="text-sm text-slate-500 mt-1">Events you are hosting or organizing.</p>
            </div>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white text-sm font-semibold shadow-subtle hover:bg-primary-hover"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading your events...</div>
        ) : showLogin ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <p className="text-lg font-semibold text-slate-800 mb-2">Log in to see your hosted events</p>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
            >
              Go to Login
            </a>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <p className="text-xl font-semibold text-slate-800 mb-2">No hosted events yet</p>
            <p className="text-sm text-slate-500 mb-6">Create an event to share it with the community.</p>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white text-sm font-semibold hover:bg-primary-hover"
            >
              Host an Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                <div className="aspect-[4/3] w-full bg-gray-100 relative">
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl text-slate-300">🗓</div>
                  )}
                  {event.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 border border-gray-200">
                      {event.category}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition">
                    {event.title}
                  </h3>
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>
                        {formatTime(event.startTime)}
                        {event.endTime ? ` - ${formatTime(event.endTime)}` : null}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="truncate">{event.location || "TBD"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
