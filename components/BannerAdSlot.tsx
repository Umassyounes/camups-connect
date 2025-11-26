type BannerAdSlotProps = {
  headline?: string
  body?: string
  sponsor?: string
  ctaLabel?: string
  href?: string
  price?: string
}

export default function BannerAdSlot({
  headline = 'Fuel finals week with Beacon Pizza',
  body = 'UMass students get 20% off large pies + free delivery to campus housing when you mention Campus Connect.',
  sponsor = 'Sponsored by Beacon Pizza Co.',
  ctaLabel = 'Order now',
  href = '#',
  price = '$3 / week placement',
}: BannerAdSlotProps) {
  return (
    <aside className="border border-dashed border-border rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 dark:from-orange-400/10 dark:via-amber-400/10 dark:to-rose-400/10 p-4 sm:p-5 flex flex-col gap-3 shadow-subtle" aria-label="Local sponsor banner">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">
        <span>Local sponsor</span>
        <span>{price}</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{headline}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{body}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <span>{sponsor}</span>
        <span className="hidden sm:inline">•</span>
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          className="text-xs font-semibold text-primary hover:underline"
        >
          {ctaLabel} →
        </a>
      </div>
    </aside>
  )
}
