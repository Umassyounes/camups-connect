'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  isMenu?: boolean
}

const items: NavItem[] = [
  {
    href: '/',
    label: 'Marketplace',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M5 8h14l-1 10H6L5 8zM9 12h6" />
      </svg>
    ),
    exact: true,
  },
  {
    href: '/events',
    label: 'Events',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V4m8 3V4m-9 8h10M5 20h14a1 1 0 001-1V7H4v12a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H7l-3 3V6z" />
      </svg>
    ),
  },
  {
    href: '#post',
    label: 'Post',
    isMenu: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const path = usePathname()
  const [showPostMenu, setShowPostMenu] = useState(false)
  const postActive = path.startsWith('/listings') || path.startsWith('/events/new')

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--background-elevated)]/95 backdrop-blur shadow-subtle sm:hidden">
        <ul className="mx-auto flex max-w-xl items-center justify-between px-3 py-2 text-xs font-medium text-foreground-secondary">
          {items.map((item) => {
            const isActive = item.isMenu ? postActive : item.exact ? path === item.href : path.startsWith(item.href)
            if (item.isMenu) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => setShowPostMenu((v) => !v)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 border transition-colors ${
                    postActive || showPostMenu
                      ? 'text-primary bg-primary/15 border-primary/40 shadow-subtle'
                      : 'text-foreground-secondary border-slate-200/80 bg-white hover:text-foreground hover:bg-slate-100'
                  }`}
                >
                    <span aria-hidden>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 border transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/15 border-primary/40 shadow-subtle'
                      : 'text-foreground-secondary border-slate-200/80 bg-white hover:text-foreground hover:bg-slate-100'
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {showPostMenu && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={() => setShowPostMenu(false)}
            aria-label="Close post menu"
          />
          <div className="fixed inset-x-4 bottom-20 z-50 rounded-xl border border-border bg-[var(--background-elevated)] shadow-xl sm:hidden">
            <div className="divide-y divide-border text-sm font-medium text-foreground">
              <Link
                href="/listings/new"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                onClick={() => setShowPostMenu(false)}
              >
                <span className="rounded-full bg-primary/10 text-primary p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M5 8h14l-1 10H6L5 8zM9 12h6" />
                  </svg>
                </span>
                <span>Post Item</span>
              </Link>
              <Link
                href="/events/new"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                onClick={() => setShowPostMenu(false)}
              >
                <span className="rounded-full bg-secondary/10 text-secondary p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V4m8 3V4m-9 8h10M5 20h14a1 1 0 001-1V7H4v12a1 1 0 001 1z" />
                  </svg>
                </span>
                <span>Post Event</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
