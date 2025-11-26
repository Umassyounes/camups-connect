"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { sb } from "@/lib/supabase/browser"
import ListingCard from "@/components/ListingCard"
import VerifiedBadge from "@/components/VerifiedBadge"
import type { Database } from "@/lib/supabase/databaseTypes"

type Profile = {
  id: number
  name: string | null
  avatarUrl: string | null
  phone: string | null
  phoneVerified: boolean
  campusArea: string | null
  bio: string | null
  createdAt: string
  averageRating: number
  totalRatings: number
  totalTransactions: number
}
type ListingRow = Database['public']['Tables']['Listing']['Row']
type CategoryRow = Database['public']['Tables']['Category']['Row']
type ListingWithRelations = ListingRow & {
  category?: CategoryRow | null
  seller?: {
    id: number
    name: string | null
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<ListingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    campusArea: "",
    bio: ""
  })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    const supabase = sb()
    
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) {
        window.location.href = "/login"
      } else {
        setUser(user)
        fetchProfile()
      }
    })
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      
      if (data.data) {
        setProfile(data.data)
        setEditForm({
          name: data.data.name || "",
          phone: data.data.phone || "",
          campusArea: data.data.campusArea || "",
          bio: data.data.bio || ""
        })
        setAvatarPreview(data.data.avatarUrl)
        
        // Fetch all user listings (including sold ones)
        const listingsRes = await fetch('/api/listings')
        const listingsData = await listingsRes.json()
        if (listingsData.data) {
          // Filter to get only the user's listings (both active and sold)
          const userListings = listingsData.data.filter((l: any) => l.seller.id === data.data.id)
          setListings(userListings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      let avatarUrl = profile?.avatarUrl

      // Upload avatar if a new file was selected
      if (avatarFile) {
        setUploadingAvatar(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', avatarFile)
        uploadFormData.append('type', 'photo') // Changed from 'avatar' to 'photo'

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          if (uploadData.data?.url) {
            avatarUrl = uploadData.data.url
          }
        } else {
          alert('Failed to upload avatar')
          setUploadingAvatar(false)
          setSaving(false)
          return
        }
        setUploadingAvatar(false)
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          avatarUrl
        })
      })
      
      const data = await res.json()
      if (data.data) {
        setProfile(data.data)
        setAvatarPreview(data.data.avatarUrl)
        setAvatarFile(null)
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setAvatarFile(file)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  function removeAvatar() {
    setAvatarFile(null)
    setAvatarPreview(profile?.avatarUrl || null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!profile || !user) return null

  const email = user.email ?? "unknown@umb.edu"
  const name = profile.name || email.split("@")[0]

  return (
    <div className="max-w-6xl w-full mx-auto space-y-8 p-4 sm:p-6">
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <span className="inline-block px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition">
                        {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                      </span>
                    </label>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-sm text-error hover:text-error-dark hover:underline transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground-secondary mt-2">
                  Recommended: Square image, max 5MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                  placeholder="(123) 456-7890"
                />
                <p className="text-xs text-foreground-secondary mt-1">
                  For easier meetup coordination
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campus Area</label>
                <select
                  value={editForm.campusArea}
                  onChange={(e) => setEditForm({ ...editForm, campusArea: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                >
                  <option value="">Select area</option>
                  <option value="North Campus">North Campus</option>
                  <option value="South Campus">South Campus</option>
                  <option value="Harbor Campus">Harbor Campus</option>
                  <option value="Off-Campus">Off-Campus</option>
                  <option value="Dorchester">Dorchester</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-foreground-secondary mt-1">
                  Where you usually meet for pickup/dropoff
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 border border-border rounded-lg hover:bg-[var(--background-elevated)] hover:border-primary transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg"
                disabled={saving || uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card - Made wider to fit long usernames */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)] backdrop-blur space-y-4 min-w-[320px] lg:mr-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={name}
                  className="h-24 w-24 rounded-3xl object-cover border-4 border-white shadow-[0_15px_35px_rgba(15,23,42,0.15)]"
                />
              ) : (
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500/70 to-purple-500/70 flex items-center justify-center text-3xl font-black text-white shadow-[0_15px_35px_rgba(99,102,241,0.45)]">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Username size reduced & long names wrapped for better readability */}
              <h2 className="mt-4 text-xl font-bold break-all leading-snug text-slate-900">{name}</h2>
              <p className="text-sm font-medium text-slate-500">@{email.split("@")[0]}</p>
              
              {/* Verification Badges */}
              <div className="flex gap-2 mt-2">
                <VerifiedBadge type="email" size="sm" />
                {profile.phoneVerified && <VerifiedBadge type="phone" size="sm" />}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              {[{
                label: 'Listings', value: listings.length
              }, {
                label: 'Sold', value: listings.filter(l => l.isSold).length
              }, {
                label: 'Deals', value: profile.totalTransactions || 0
              }].map((stat) => (
                <div className="text-center" key={stat.label}>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Rating Display */}
            {profile.totalRatings > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                <div className="flex items-center justify-center gap-3 text-amber-900">
                  <div className="flex text-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(profile.averageRating) ? 'text-yellow-400' : 'text-yellow-200'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-2xl font-black">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-sm font-semibold">
                    ({profile.totalRatings} {profile.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Edit Profile
              </button>
              <form action="/auth/signout" method="post">
                <button className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
                  Logout
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 text-sm">
              {profile.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phone</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{profile.phone}</span>
                    {profile.phoneVerified && (
                      <span className="text-xs text-success">Verified</span>
                    )}
                  </div>
                </div>
              )}
              {!profile.phoneVerified && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <p className="text-xs text-amber-900 mb-2 font-semibold">
                    📱 Verify your phone number to build trust with other users
                  </p>
                  <a 
                    href="/verify-phone"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Verify Phone Number →
                  </a>
                </div>
              )}
              {profile.campusArea && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Campus Area</span>
                  <span className="font-semibold text-slate-900">{profile.campusArea}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Member Since</span>
                <span className="font-semibold text-slate-900">
                  {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>
              {profile.bio && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Bio</span>
                  <p className="text-sm text-slate-900">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="lg:col-span-2 lg:pl-6">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">inventory</p>
                <h2 className="text-3xl font-black text-slate-900">My Listings</h2>
                <p className="text-sm text-slate-500">Showcase your items and track sales in one view.</p>
              </div>
              <a
                href="/listings/new"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                + New Listing
              </a>
            </div>
            {listings.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center text-slate-500">
                <p className="text-lg font-semibold text-slate-900">No listings yet</p>
                <p className="text-sm">Launch your first listing to reach other Beacons.</p>
                <a href="/listings/new" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(99,102,241,0.35)]">
                  Create Your First Listing
                </a>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
