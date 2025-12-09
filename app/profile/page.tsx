"use client"
import { useEffect, useState } from "react"
import { sb } from "@/lib/supabase/browser"
import VerifiedBadge from "@/components/VerifiedBadge"

type Profile = {
  id: number
  name: string | null
  avatarUrl: string | null
  phone: string | null
  phoneVerified: boolean
  bio: string | null
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: ""
  })
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [phoneToVerify, setPhoneToVerify] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [phoneSuccess, setPhoneSuccess] = useState("")
  const [resettingPhone, setResettingPhone] = useState(false)

  useEffect(() => {
    const supabase = sb()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) {
        window.location.href = "/login"
      } else {
        setUser(u)
        fetchProfile()
      }
    })
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (data.data) {
        setProfile(data.data)
        setEditForm({
          name: data.data.name || "",
          phone: data.data.phone || "",
          bio: data.data.bio || ""
        })
        setAvatarPreview(data.data.avatarUrl)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      let avatarUrl = profile?.avatarUrl
      if (avatarFile) {
        setUploadingAvatar(true)
        const uploadFormData = new FormData()
        uploadFormData.append("file", avatarFile)
        uploadFormData.append("type", "photo")

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          if (uploadData.data?.url) {
            avatarUrl = uploadData.data.url
          }
        } else {
          alert("Failed to upload avatar")
          setUploadingAvatar(false)
          setSaving(false)
          return
        }
        setUploadingAvatar(false)
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          avatarUrl,
        }),
      })

      const data = await res.json()
      if (data.data) {
        setProfile(data.data)
        setAvatarPreview(data.data.avatarUrl)
        setAvatarFile(null)
        setShowEditModal(false)
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function removeAvatar() {
    setAvatarFile(null)
    setAvatarPreview(profile?.avatarUrl || null)
  }

  // Phone verification functions
  async function sendVerificationCode() {
    if (!phoneToVerify.trim()) {
      setPhoneError("Please enter a phone number")
      return
    }
    
    setSendingCode(true)
    setPhoneError("")
    setPhoneSuccess("")
    
    try {
      const res = await fetch("/api/phone/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToVerify })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code")
      }
      
      setCodeSent(true)
      setPhoneSuccess(data.devMode 
        ? `Dev mode: Your code is ${data.code}` 
        : "Verification code sent! Check your phone.")
    } catch (error: any) {
      setPhoneError(error.message)
    } finally {
      setSendingCode(false)
    }
  }

  async function verifyCode() {
    if (!verificationCode.trim()) {
      setPhoneError("Please enter the verification code")
      return
    }
    
    setVerifyingCode(true)
    setPhoneError("")
    setPhoneSuccess("")
    
    try {
      const res = await fetch("/api/phone/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify code")
      }
      
      setPhoneSuccess("Phone verified successfully!")
      setShowPhoneVerification(false)
      setCodeSent(false)
      setVerificationCode("")
      setPhoneToVerify("")
      fetchProfile() // Refresh profile to show verified status
    } catch (error: any) {
      setPhoneError(error.message)
    } finally {
      setVerifyingCode(false)
    }
  }

  function openPhoneVerification() {
    setPhoneToVerify(profile?.phone || "")
    setShowPhoneVerification(true)
    setCodeSent(false)
    setVerificationCode("")
    setPhoneError("")
    setPhoneSuccess("")
  }

  async function resetPhoneVerification() {
    if (!confirm("Are you sure you want to reset your phone verification? You'll need to verify again.")) {
      return
    }
    
    setResettingPhone(true)
    
    try {
      const res = await fetch("/api/phone/reset", {
        method: "POST"
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset phone verification")
      }
      
      alert("Phone verification reset! You can now verify again.")
      fetchProfile() // Refresh profile
    } catch (error: any) {
      alert(error.message)
    } finally {
      setResettingPhone(false)
    }
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
  const memberYear = new Date(profile.createdAt).getFullYear()

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 pb-16 space-y-6">
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl p-4 md:p-6 max-w-md w-full mx-3 md:mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-slate-400">?</span>
                    )}
                  </div>
                  <div className="space-x-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                      Upload
                    </label>
                    {avatarFile && (
                      <button
                        onClick={removeAvatar}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-[var(--background-elevated)]"
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                  placeholder="(555) 123-4567"
                />
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
                {uploadingAvatar ? "Uploading..." : saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showPhoneVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl p-4 md:p-6 max-w-md w-full mx-3 md:mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">📱 Verify Phone Number</h3>
              <button
                onClick={() => setShowPhoneVerification(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {!codeSent ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter your phone number to receive a verification code via SMS.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneToVerify}
                    onChange={(e) => setPhoneToVerify(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-[var(--input-bg)] text-foreground"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                {phoneError && (
                  <p className="text-red-600 text-sm">{phoneError}</p>
                )}
                {phoneSuccess && (
                  <p className="text-green-600 text-sm">{phoneSuccess}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPhoneVerification(false)}
                    className="flex-1 py-2 border border-border rounded-lg hover:bg-[var(--background-elevated)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                    className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sendingCode ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter the 6-digit code sent to {phoneToVerify}
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full border border-border rounded-lg px-3 py-3 bg-[var(--input-bg)] text-foreground text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                
                {phoneError && (
                  <p className="text-red-600 text-sm">{phoneError}</p>
                )}
                {phoneSuccess && (
                  <p className="text-green-600 text-sm">{phoneSuccess}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCodeSent(false)}
                    className="flex-1 py-2 border border-border rounded-lg hover:bg-[var(--background-elevated)] transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyCode}
                    disabled={verifyingCode || verificationCode.length !== 6}
                    className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {verifyingCode ? "Verifying..." : "Verify"}
                  </button>
                </div>
                
                <button
                  onClick={sendVerificationCode}
                  disabled={sendingCode}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  {sendingCode ? "Sending..." : "Resend code"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{name}</h1>
                  <VerifiedBadge 
                    isVerified={true} 
                    phoneVerified={profile.phoneVerified} 
                    type="both" 
                    size="lg" 
                  />
                </div>
                <p className="text-sm md:text-base text-slate-500">{email}</p>
                <p className="text-sm text-slate-500">Member since {memberYear}</p>
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex-shrink-0 self-start md:self-center inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition shadow-subtle"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="pt-2">
            <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-2">Bio</h3>
            <p className="text-base md:text-lg text-slate-900">
              {profile.bio || "Add a short bio so others can learn about you."}
            </p>
          </div>
        </div>

        {/* Phone Verification Section */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Phone Verification</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {profile.phoneVerified ? (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Phone Verified</span>
                  </div>
                  {profile.phone && (
                    <span className="text-slate-500">{profile.phone}</span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>Phone not verified</span>
                </div>
              )}
            </div>
            
            {profile.phoneVerified ? (
              <button
                onClick={resetPhoneVerification}
                disabled={resettingPhone}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                {resettingPhone ? "Resetting..." : "Reset Verification"}
              </button>
            ) : (
              <button
                onClick={openPhoneVerification}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                Verify Phone
              </button>
            )}
          </div>
          
          {!profile.phoneVerified && (
            <p className="text-sm text-slate-500 mt-2">
              Verify your phone number to increase trust and unlock more features.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
