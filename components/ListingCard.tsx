import Link from 'next/link'

export default function ListingCard({ listing }: { listing: any }) {
  const price = `$${(listing.priceCents / 100).toFixed(2)}`
  return (
    <Link href={`/listings/${listing.id}`} className="group block rounded-2xl border bg-white shadow-sm">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.imageUrl || '/no-image.png'} alt={listing.title}
             className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-1 font-medium">{listing.title}</h3>
          <span className="whitespace-nowrap text-sm font-semibold">{price}</span>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">{listing.description}</p>
        <div className="text-xs text-gray-500">{listing.category?.name} • {listing.condition}</div>
      </div>
    </Link>
  )
}
