'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

const items: NavItem[] = [
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
    href: '/messages',
    label: 'Messages',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H7l-3 3V6z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 1112 0H6z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--background-elevated)]/95 backdrop-blur shadow-subtle sm:hidden">
      <ul className="mx-auto flex max-w-xl items-center justify-between px-3 py-2 text-xs font-medium text-foreground-secondary">
        {items.map((item) => {
          const isActive = item.exact ? path === item.href : path.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-foreground-secondary hover:text-foreground'
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
  )
}
