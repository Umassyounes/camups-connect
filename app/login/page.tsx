"use client"
import { useState } from "react"
import { sb } from "@/lib/supabase/browser"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = sb()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
    })
    setMsg(error ? error.message : "Check your email for the magic link ✨")
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input className="w-full rounded border p-2" type="email" required
               value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@umb.edu" />
        <button className="w-full rounded bg-blue-600 p-2 text-white">Send Magic Link</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  )
}
