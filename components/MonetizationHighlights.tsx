type MonetizationStream = {
  key: string
  title: string
  price: string
  description: string
  includes: string[]
  projection: string
  cta: {
    label: string
    href: string
  }
  accent: string
  icon: string
}

const monetizationStreams: MonetizationStream[] = [
  {
    key: 'pro',
    title: 'Pro Memberships',
    price: '$4.99 / month',
    description: 'Students unlock featured posts, homepage visibility, and unlimited boosts.',
    includes: ['Instant “Pro” badge on all listings', 'Featured placement rotation on home + category feeds', 'Unlimited manual boosts included'],
    projection: 'If 50 members subscribe → $249.50 / month',
    cta: {
      label: 'Upgrade to Pro',
      href: '/profile#pro-membership',
    },
    accent: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    icon: '🚀',
  },
  {
    key: 'boosts',
    title: 'Boosted Listings',
    price: '$1.00 / 24 hours',
    description: 'Sellers jump their listing to the top of search and campus feeds.',
    includes: ['One-tap boost button on listings you own', 'Visible “🔥 Boosted” chip to buyers', 'Stacks with Pro placement for extra reach'],
    projection: 'If 10 boosts per week → ≈ $40 / month',
    cta: {
      label: 'View my listings',
      href: '/my',
    },
    accent: 'from-orange-500/25 via-yellow-500/15 to-transparent',
    icon: '🔥',
  },
  {
    key: 'events',
    title: 'Sponsored Events',
    price: '$5 – $10 per slot',
    description: 'Clubs and local shops highlight events in the new spotlight rail.',
    includes: ['Tiered spotlight cards on /events', 'Organizer dashboard request form', 'Badge + promo link on event detail'],
    projection: 'If 8 slots sell per month → ≈ $60 / month',
    cta: {
      label: 'Browse events',
      href: '/events',
    },
    accent: 'from-amber-500/25 via-rose-400/10 to-transparent',
    icon: '✨',
  },
  {
    key: 'ads',
    title: 'In-app Banner Ads',
    price: '$3 / week',
    description: 'Reserved banner slots for neighborhood pizza shops, tutoring, or housing leads.',
    includes: ['Lightweight banner component inside marketplace feed', 'Clickable CTA tracking', 'Simple Google Form intake to sell inventory'],
    projection: '4 live ads per month → ≈ $48 / month',
    cta: {
      label: 'Reserve a banner',
      href: '/monetize#banner-intake',
    },
    accent: 'from-green-500/20 via-emerald-500/10 to-transparent',
    icon: '📣',
  },
]

export default function MonetizationHighlights() {
  return (
    <section className="mt-16" aria-labelledby="monetization-title">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground-secondary">Monetization</p>
          <h2 id="monetization-title" className="text-2xl md:text-3xl font-bold text-foreground">Turn Campus Connect into a self-sustaining marketplace</h2>
          <p className="text-sm text-foreground-secondary max-w-2xl mt-2">
            Every feature is wired into the existing Supabase + Next.js stack—no extra tooling required. Pick one stream or stack all four.
          </p>
        </div>
        <a
          href="/monetize"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Explore revenue playbook →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monetizationStreams.map((stream) => (
          <article
            key={stream.key}
            className="rounded-2xl border border-border bg-[var(--card-bg)] shadow-subtle overflow-hidden"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${stream.accent}`} aria-hidden />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground-secondary">{stream.title}</p>
                  <p className="text-xl font-bold text-foreground">{stream.price}</p>
                </div>
                <span className="text-3xl" aria-hidden>{stream.icon}</span>
              </div>
              <p className="text-sm text-foreground-secondary">{stream.description}</p>
              <ul className="space-y-1 text-sm">
                {stream.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-[var(--background-elevated)] border border-dashed border-border px-3 py-2 text-xs text-foreground-secondary">
                {stream.projection}
              </div>
              <a
                href={stream.cta.href}
                className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition"
              >
                {stream.cta.label}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
