'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import NotificationBell from "./NotificationBell"
import UserButton from "./UserButton"
import AdminNavLink from "./AdminNavLink"

type NavLink = {
  href: string
  label: string
  match?: (path: string) => boolean
}

const links: NavLink[] = [
  { href: "/", label: "Marketplace", match: (p) => p === "/" || p.startsWith("/listings") },
  { href: "/events", label: "Events" },
  { href: "/messages", label: "Messages" },
]

export default function Header() {
  const pathname = usePathname() || "/"
  const postActive = pathname.startsWith("/listings") || pathname.startsWith("/events/new")

  const isActive = (link: NavLink) => {
    if (link.match) return link.match(pathname)
    return pathname.startsWith(link.href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_15px_45px_rgba(15,23,42,0.08)]">
      <div className="mx-auto w-full max-w-7xl grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6 px-3 md:px-6 py-3 md:py-4">
        {/* Left: Logo */}
        <a href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0 group justify-self-start">
          <img src="/logo.png" alt="Campus Connect" className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-[0_8px_30px_rgba(76,110,245,0.35)]" />
          <div className="hidden sm:block">
            <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600">
              Campus Connect
            </div>
            <div className="font-semibold text-xs tracking-[0.25em] uppercase text-sky-600">By Beacons, For Beacons</div>
          </div>
        </a>

        {/* Center: Main nav */}
        <nav className="hidden lg:flex items-center justify-center gap-2 md:gap-4 text-sm font-semibold">
          {links.map((link) => {
            const active = isActive(link)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  active
                    ? "text-primary bg-primary/10 border-primary/30 shadow-subtle"
                    : "text-slate-600 border-transparent hover:text-primary hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          <div className="relative group">
            <button
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 border transition-colors ${
                postActive
                  ? "text-primary bg-primary/10 border-primary/30 shadow-subtle"
                  : "text-slate-700 border-transparent hover:bg-slate-100"
              }`}
            >
              <span>Post</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-xl z-50">
              <a href="/listings/new" className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50">Items</a>
              <a href="/events/new" className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50">Events</a>
            </div>
          </div>

          <AdminNavLink
            className="px-3 py-1.5 rounded-lg border border-transparent text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
            activeClassName=" text-primary bg-primary/10 border-primary/30 shadow-subtle"
          />
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 md:gap-3 justify-self-end">
          <NotificationBell />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
