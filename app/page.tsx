'use client'
import { prisma } from '@/lib/prisma'
import ListingCard from '../components/ListingCard'
import FilterBar from '../components/FilterBar'
import BottomNav from '../components/BottomNav'
import CategoryTabs from "@/components/CategoryTabs"

export const dynamic = "force-dynamic"

export default async function Marketplace({ searchParams }: { searchParams?: { category?: string | null } }) {
  const selected = (searchParams?.category ?? "All") as string

  const client = prisma as any

  try {
    const categories: { id: string; name: string }[] = await client.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })

    const listings = await client.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    })

    const filtered =
      selected && selected !== "All"
        ? listings.filter((l: any) => (l?.Category?.name || "").toLowerCase() === selected.toLowerCase())
        : listings

    return (
      <main className="mx-auto max-w-5xl p-6">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold">Campus Connect</h1>
          <p className="text-sm text-gray-500">For Beacons, by Beacons</p>
        </header>

        <CategoryTabs />
        <FilterBar categories={categories as unknown as { id: number; name: string }[]} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((l: any) => <ListingCard key={l.id} listing={l} />)}
        </section>

        <BottomNav />
      </main>
    )
  } catch (err) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Campus Connect</h1>
        <p className="rounded-lg border bg-red-50 p-4 text-sm">
          Couldn’t load listings. Check your Prisma schema and server logs.
        </p>
      </main>
    )
  }
}
