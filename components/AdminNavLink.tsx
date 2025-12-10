'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Props = {
  className?: string
  activeClassName?: string
}

export default function AdminNavLink({ className = '', activeClassName = '' }: Props) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)
  const pathname = usePathname() || ''
  const isActive = pathname.startsWith('/admin')

  useEffect(() => {
    let isMounted = true

    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
          if (isMounted) setChecked(true)
          return
        }

        const body = await res.json()
        if (!isMounted) return

        const profile = body?.data
        if (profile?.role === 'admin' || profile?.role === 'moderator' || profile?.isAdmin) {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Failed to check admin status:', error)
      } finally {
        if (isMounted) setChecked(true)
      }
    }

    checkAdmin()

    return () => {
      isMounted = false
    }
  }, [])

  if (!checked || !isAdmin) {
    return null
  }

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim()

  return (
    <a href="/admin" className={combinedClass || undefined}>
      Admin
    </a>
  )
}
