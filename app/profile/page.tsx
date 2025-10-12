// app/profile/page.tsx
import { redirect } from "next/navigation"
import { sbServer } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = sbServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not signed in? bounce to login
  if (!user) redirect("/login")

  const email = user.email ?? "unknown@umb.edu"
  const name =
    (user.user_metadata?.name as string | undefined) ||
    email.split("@")[0] // simple fallback

  const avatar =
    (user.user_metadata?.avatar_url as string | undefined) ||
    "/next.svg" // fallback image in /public

  return (
    <main className="mx-auto max-w-lg p-6 space-y-6">
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={name}
          className="h-16 w-16 rounded-full border object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-gray-600">@{email.split("@")[0]}</p>
        </div>
      </div>

      <div className="rounded-xl border">
        <a className="block px-4 py-3 border-b" href="/my/listings">
          My Listings
        </a>
        <a className="block px-4 py-3 border-b" href="/my/saved">
          Saved Items
        </a>
        <form action="/auth/signout" method="post">
          <button className="block w-full text-left px-4 py-3 text-red-600">
            Logout
          </button>
        </form>
      </div>
    </main>
  )
}
