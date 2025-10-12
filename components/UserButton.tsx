"use client"
import { useEffect, useState } from "react"
import { sb } from "@/lib/supabase/browser"

export default function UserButton() {
  const [email, setEmail] = useState<string|null>(null)
  useEffect(() => { sb().auth.getUser().then(({data}) => setEmail(data.user?.email ?? null)) }, [])
  if (!email) return <a href="/login" className="underline">Sign in</a>
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">Hi, {email}</span>
      <button onClick={() => sb().auth.signOut().then(()=>location.reload())}
              className="rounded border px-3 py-1">Sign out</button>
    </div>
  )
}
