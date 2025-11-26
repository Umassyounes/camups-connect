import MonetizationHighlights from "@/components/MonetizationHighlights"
import BannerAdSlot from "@/components/BannerAdSlot"

const projections = [
  { label: 'Pro subscriptions', amount: '$249.50 / mo', detail: '50 students × $4.99' },
  { label: 'Boosted listings', amount: '$40.00 / mo', detail: '10 boosts each week' },
  { label: 'Sponsored events', amount: '$60.00 / mo', detail: '8 spotlights per month' },
  { label: 'Banner ads', amount: '$48.00 / mo', detail: '4 weekly ad slots' },
]

const faqs = [
  {
    question: 'How do students upgrade to Pro?',
    answer: 'The profile page now includes a Pro membership card with a one-click subscribe button wired to /api/pro. Students see the badge instantly after upgrading.',
  },
  {
    question: 'Where can sellers boost listings?',
    answer: 'Listing owners see a “🔥 Boost Listing ($1 for 24h)” button on their listing detail page and /my dashboard. Boosts update Supabase and refresh the feed automatically.',
  },
  {
    question: 'How are sponsored events requested?',
    answer: 'Event organizers can open an event detail page and expand the “Promote this event” panel. A tier selector submits to /api/events/[id]/sponsor and updates spotlight slots.',
  },
  {
    question: 'What about banner ads?',
    answer: 'Use the lightweight BannerAdSlot component on high-traffic pages. A Google Form (or email) intake lets local shops reserve a week-long placement for $3.',
  },
]

export default function MonetizePage() {
  const total = '$397.50 / month'

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border bg-[var(--card-bg)] p-8 shadow-float">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground-secondary">Revenue Playbook</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-3">Monetize Campus Connect without extra vendors</h1>
        <p className="text-sm md:text-base text-foreground-secondary mt-3 max-w-3xl">
          Every monetization lever below is already backed by Supabase tables, API routes, and UI entry points. Share this page with club leaders or local partners to explain the value props and pricing.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projections.map((item) => (
            <div key={item.label} className="rounded-2xl border border-dashed border-border p-4 bg-[var(--background-elevated)]">
              <p className="text-xs uppercase tracking-wide text-foreground-secondary">{item.label}</p>
              <p className="text-2xl font-bold mt-2 text-foreground">{item.amount}</p>
              <p className="text-xs text-foreground-secondary mt-1">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-foreground-secondary">
          Stack all four and you&apos;re looking at roughly <span className="font-semibold text-foreground">{total}</span> that can be reinvested into moderation, swag, or campus events.
        </p>
      </section>

      <MonetizationHighlights />

      <section id="banner-intake" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[var(--card-bg)] p-6 space-y-4">
          <h2 className="text-2xl font-bold">Quick-start checklist</h2>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground">
            <li>Drop the <code className="px-1 py-0.5 bg-[var(--background-elevated)] rounded">&lt;MonetizationHighlights /&gt;</code> component onto any marketing page.</li>
            <li>Feature the BannerAdSlot on home, events, and messages to give advertisers guaranteed impressions.</li>
            <li>Share <a href="/events" className="text-primary hover:underline">/events</a> with club leaders so they can request sponsorship tiers.</li>
            <li>Send pro upgrade reminders inside onboarding emails and message receipts.</li>
          </ol>
          <p className="text-xs text-foreground-secondary">Need more placement ideas? Add banner slots to /messages, /my, or mod dashboards.</p>
        </div>
        <BannerAdSlot
          headline="Advertise here for $3/week"
          body="We rotate small 320×100 banners from local pizza shops, tutoring centers, and housing leads. Reserve a week and reach 1,200+ weekly sessions."
          sponsor="Monetization pilot"
          ctaLabel="Submit interest"
          href="https://forms.gle/"
          price="$3 / week"
        />
      </section>

      <section className="rounded-2xl border border-border bg-[var(--card-bg)] p-6">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="rounded-xl border border-border p-4">
              <summary className="font-semibold cursor-pointer text-foreground">{question}</summary>
              <p className="mt-2 text-sm text-foreground-secondary">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
