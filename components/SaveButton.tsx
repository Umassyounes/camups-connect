"use client"
import { useState, useEffect } from "react"

interface SaveButtonProps {
  listingId: number
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function SaveButton({ listingId, className = "", showText = false, size = 'md' }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Check if user is authenticated and if listing is saved
  useEffect(() => {
    async function checkSavedStatus() {
      try {
        const res = await fetch(`/api/saved-listings/check?listingId=${listingId}`)
        if (res.ok) {
          const data = await res.json()
          setIsSaved(data.isSaved)
          setIsAuthenticated(true)
        } else if (res.status === 401) {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Failed to check saved status:", error)
      }
    }
    
    checkSavedStatus()
  }, [listingId])

  async function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirectTo=/listings/${listingId}`
      return
    }

    setIsLoading(true)
    try {
      if (isSaved) {
        // Unsave
        const res = await fetch(`/api/saved-listings?listingId=${listingId}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setIsSaved(false)
        }
      } else {
        // Save
        const res = await fetch('/api/saved-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId })
        })
        if (res.ok) {
          setIsSaved(true)
        } else {
          const data = await res.json()
          if (data.error === "You cannot save your own listing") {
            alert("You can't save your own listing")
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle save:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-200
        ${isSaved 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        shadow-md hover:shadow-lg
        flex items-center gap-1.5
        ${className}
      `}
      title={isSaved ? 'Remove from saved' : 'Save listing'}
      aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
    >
      {isLoading ? (
        <svg className={`${iconSizes[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg 
          className={iconSizes[size]} 
          fill={isSaved ? "currentColor" : "none"} 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={isSaved ? 0 : 2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
      {showText && (
        <span className="text-sm font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
