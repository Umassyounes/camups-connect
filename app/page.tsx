'use client' // keep as in your original file (this line may or may not be present)
import { prisma } from '@/lib/prisma'
import ListingCard from '../components/ListingCard'
import FilterBar from '../components/FilterBar'
import BottomNav from '../components/BottomNav'

export default async function Marketplace() {
  const client = prisma as any

  const categories: { id: string; name: string }[] = await client.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  // NOTE: Use the exact relation name from your Prisma schema (case-sensitive).
  // The relation in the schema appears to be "Category" (capital C), so we include it like this:
  const listings = await client.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      Category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, name: true, email: true } },
    },
  })

  return (
    <main className="pb-20">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Campus Connect</h1>
        <p className="text-sm text-gray-500">For Beacons, by Beacons</p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-white">All</span>
        {categories.map(c => (
          <span key={c.id} className="rounded-full bg-gray-100 px-3 py-1 text-gray-800">
            {c.name}
          </span>
        ))}
      </div>

      {/* If FilterBar expects categories as numbers, cast if needed */}
      <FilterBar categories={categories as unknown as { id: number; name: string }[]} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {listings.map((l: any) => <ListingCard key={l.id} listing={l} />)}
      </section>

      <BottomNav />
    </main>
  )
}