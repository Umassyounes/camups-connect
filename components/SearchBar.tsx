"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

type SearchResult = {
  listings: Array<{
    id: number
    title: string
    description: string
    priceCents: number
    imageUrl: string | null
    isSold: boolean
    category: { name: string } | null
  }>
  events: Array<{
    id: number
    title: string
    description: string
    eventDate: string
    location: string
    imageUrl: string | null
    category: string | null
  }>
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({ listings: [], events: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ listings: [], events: [] })
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setIsOpen(true)
        }
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleResultClick(type: "listing" | "event", id: number) {
    setIsOpen(false)
    setQuery("")
    router.push(type === "listing" ? `/listings/${id}` : `/events/${id}`)
  }

  const totalResults = results.listings.length + results.events.length

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        {/* Search Icon */}
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718096]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items, events, textbooks, furniture..."
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-3.5 pl-12 text-base text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#4F7CFF] focus:outline-none focus:ring-4 focus:ring-[#4F7CFF]/10 transition-all shadow-sm"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4F7CFF] border-t-transparent" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl max-h-96 overflow-y-auto z-50">
          {totalResults === 0 ? (
            <div className="p-6 text-center text-sm text-[#718096]">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {/* Listings */}
              {results.listings.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-3 text-xs font-bold text-[#4A5568] uppercase tracking-wider bg-gray-50">
                    Marketplace
                  </div>
                  {results.listings.map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => handleResultClick("listing", listing.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F7FA] transition text-left"
                    >
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A202C] truncate">
                          {listing.title}
                        </p>
                        <p className="text-xs text-[#718096] flex items-center gap-2">
                          <span className="font-bold text-[#4F7CFF]">${(listing.priceCents / 100).toFixed(0)}</span>
                          {listing.category && <span>• {listing.category.name}</span>}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <div className="px-4 py-3 text-xs font-bold text-[#4A5568] uppercase tracking-wider bg-gray-50">
                    Events
                  </div>
                  {results.events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleResultClick("event", event.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F7FA] transition text-left"
                    >
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          📅
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A202C] truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-[#718096]">
                          {new Date(event.eventDate).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
