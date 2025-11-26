import type { FC } from 'react'

type ProBadgeProps = {
  size?: 'sm' | 'md'
  className?: string
}

const ProBadge: FC<ProBadgeProps> = ({ size = 'md', className = '' }) => {
  const base = 'inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-white/90 text-indigo-700 shadow-[0_8px_18px_rgba(99,102,241,0.25)] font-semibold uppercase tracking-[0.2em]'
  const sizes = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-[11px] px-3 py-1'

  return (
    <span className={`${base} ${sizes} ${className}`}>
      <span className="text-[8px] text-indigo-400">●</span>
      PRO
    </span>
  )
}

export default ProBadge
