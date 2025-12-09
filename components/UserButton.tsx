"use client"
import { useEffect, useState, useRef } from "react"
import { sb } from "@/lib/supabase/browser"

export default function UserButton() {
  const [user, setUser] = useState<{ email: string; name?: string; avatarUrl?: string | null } | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarCacheRef = useRef<string | null>(null) // Cache to prevent losing avatar
  
  useEffect(() => {
    const supabase = sb()
    
    // Fetch user profile with avatar
    async function fetchUserProfile(userId: string): Promise<string | null> {
      try {
        const res = await fetch('/api/profile', { 
          credentials: 'include', // Important: send cookies
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.data?.avatarUrl) {
            avatarCacheRef.current = data.data.avatarUrl // Cache the avatar
            return data.data.avatarUrl
          }
        }
      } catch (error) {
        // Silently fail - user will just see default avatar
      }
      // Return cached avatar if fetch failed
      return avatarCacheRef.current
    }
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const avatarUrl = await fetchUserProfile(session.user.id)
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0],
          avatarUrl
        })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const avatarUrl = await fetchUserProfile(session.user.id)
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0],
          avatarUrl
        })
      } else {
        setUser(null)
        avatarCacheRef.current = null // Clear cache on logout
      }
    })

    // Listen for profile updates via custom event
    const handleProfileUpdate = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const avatarUrl = await fetchUserProfile(session.user.id)
        setUser(prev => prev ? { ...prev, avatarUrl } : null)
      }
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/login"
          className="rounded-lg bg-primary px-3 py-1 text-sm font-medium text-white shadow-subtle hover:bg-primary-hover transition sm:px-4 sm:py-2"
        >
          Log in / Sign up
        </a>
      </div>
    )
  }

  const initial = user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-0.5 md:p-1 rounded-full hover:bg-gray-100 transition"
      >
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.name || "Profile"}
            className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border-2 border-primary"
          />
        ) : (
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs md:text-sm border border-primary/20">
            {initial}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#1A202C] truncate">{user.name}</p>
            <p className="text-xs text-[#718096] truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A202C] hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 text-[#4A5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </a>
            
            <a
              href="/my"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A202C] hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 text-[#4A5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Listings
            </a>

            <a
              href="/messages"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A202C] hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4 text-[#4A5568]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Messages
            </a>

            <hr className="my-1 border-gray-100" />

            <button
              onClick={() => sb().auth.signOut().then(() => location.reload())}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
