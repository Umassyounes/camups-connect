import { prisma } from '../../lib/db'

export default async function MyListingsPage() {
  const listings = await prisma.listing.findMany({
    where: { sellerId: 1 }, // TODO: use session user
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-semibold">My Listings</h1>

      <ul className="space-y-2">
        {listings.map(l => (
          <li key={l.id} className="flex items-center justify-between rounded-xl border bg-white p-3">
            <div>
              <div className="font-medium">{l.title}</div>
              <div className="text-sm text-gray-500">
                ${(l.priceCents / 100).toFixed(2)} • {l.isSold ? 'Sold' : 'Active'}
              </div>
            </div>

            <form action={`/api/listings/${l.id}`} method="post" className="flex gap-2">
              <input type="hidden" name="_method" value="PATCH" />
              {!l.isSold && (
                <button name="markSold" value="1" className="rounded-lg border px-3 py-1 text-sm">
                  Mark sold
                </button>
              )}
              <button
                formaction={`/api/listings/${l.id}`}
                formMethod="delete"
                className="rounded-lg border px-3 py-1 text-sm"
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  )
}
