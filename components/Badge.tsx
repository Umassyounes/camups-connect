"use client"

type BadgeVariant = 'success' | 'info' | 'warning' | 'purple' | 'orange' | 'default'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  icon?: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#00C853] text-white',
  info: 'bg-[#4F7CFF] text-white',
  warning: 'bg-[#FF9500] text-white',
  purple: 'bg-[#7C3AED] text-white',
  orange: 'bg-[#FF6B2C] text-white',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm'
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '',
  icon
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  )
}
