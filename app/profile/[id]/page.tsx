"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import VerifiedBadge from "@/components/VerifiedBadge"

type PublicProfile = {
  id: number
  name: string | null
  avatarUrl: string | null
  phoneVerified: boolean
  bio: string | null
  createdAt: string
  listingsCount: number
  eventsCount: number
  reviewsCount: number
  averageRating: number | null
}

export default function PublicProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/profile/${profileId}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load profile")
      }
      
      setProfile(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Profile Not Found</h1>
          <p className="text-red-600 mb-4">{error || "This user doesn't exist or their profile is private."}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const name = profile.name || "Anonymous User"
  const memberYear = new Date(profile.createdAt).getFullYear()

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 pb-16 space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl md:rounded-3xl border border-white/70 bg-white/90 shadow-[0_25px_65px_rgba(15,23,42,0.08)] p-5 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={name}
                  className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white shadow-[0_15px_35px_rgba(15,23,42,0.15)]"
                />
              ) : (
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl text-slate-400">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20a8 8 0 1116 0H4z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{name}</h1>
                  <VerifiedBadge 
                    isVerified={true} 
                    phoneVerified={profile.phoneVerified} 
                    type="both" 
                    size="lg" 
                  />
                </div>
                <p className="text-sm text-slate-500">Member since {memberYear}</p>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-2">
                  {profile.listingsCount > 0 && (
                    <span className="text-sm text-slate-600">
                      <span className="font-semibold">{profile.listingsCount}</span> listings
                    </span>
                  )}
                  {profile.reviewsCount > 0 && (
                    <span className="text-sm text-slate-600 flex items-center gap-1">
                      <span className="font-semibold">{profile.averageRating?.toFixed(1)}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-slate-500">({profile.reviewsCount})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/messages?user=${profile.id}`}
              className="self-start md:self-center inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </Link>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-2">About</h3>
            <p className="text-base md:text-lg text-slate-900">{profile.bio}</p>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Trust & Verification</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              Verified Student
            </div>
            {profile.phoneVerified && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                Phone Verified
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Member since {memberYear}
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  )
}
