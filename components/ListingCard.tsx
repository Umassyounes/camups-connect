import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/databaseTypes'
import VerifiedBadge from './VerifiedBadge'
import SaveButton from './SaveButton'

type ListingRow = Database['public']['Tables']['Listing']['Row']
type CategoryRow = Database['public']['Tables']['Category']['Row']
type ProfileRow = Database['public']['Tables']['Profile']['Row']

type ListingWithCategory = ListingRow & { 
  category?: CategoryRow | null
  seller?: Partial<ProfileRow> | { id: number; name: string | null } | null
}

type ListingCardProps = {
  listing: ListingWithCategory
  showSaveButton?: boolean
}

export default function ListingCard({ listing, showSaveButton = true }: ListingCardProps) {
  const price = typeof listing.priceCents === 'number'
    ? `$${(listing.priceCents / 100).toFixed(0)}`
    : '—'
  const altText = listing.title || 'Marketplace listing image'
  
  // Use first image from images array, fallback to imageUrl
  const displayImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : listing.imageUrl
  
  const imageCount = listing.images?.length || (listing.imageUrl ? 1 : 0)
  const isBoosted = Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date())
  const hasImage = Boolean(displayImage)
  
  // Determine condition badge color
  const getConditionBadge = (offsetPx: number = 3) => {
    const condition = listing.condition?.toLowerCase() || ''
    const baseClass = 'absolute left-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md'
    const style = { top: `${offsetPx}px` } as React.CSSProperties
    if (condition.includes('new') || condition === 'like new') {
      return <span style={style} className={`${baseClass} bg-[#00C853]`}>🟢 Like New</span>
    }
    if (condition === 'excellent') {
      return <span style={style} className={`${baseClass} bg-[#00C853]`}>✓ Excellent</span>
    }
    if (condition === 'good') {
      return <span style={style} className={`${baseClass} bg-[#4F7CFF]`}>👍 Good</span>
    }
    return null
  }
  
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image Container */}
  {/* Slightly taller to comfortably fit stacked Premium + Condition badges */}
  <div className="aspect-[4/3] md:aspect-[16/11] w-full overflow-hidden bg-gray-100 relative">
        {listing.isSold && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <div className="bg-white text-[#1A202C] text-lg font-bold px-6 py-3 rounded-xl shadow-lg">
              SOLD
            </div>
          </div>
        )}
        
        {/* Condition Badge */}
        {!listing.isSold && getConditionBadge()}
        
        {isBoosted && !listing.isSold && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md flex items-center gap-1">
            🔥 Boosted
          </div>
        )}
        
        {/* Save Button - positioned based on whether boosted badge is shown */}
        {showSaveButton && !listing.isSold && (
          <div className={`absolute ${isBoosted ? 'top-12' : 'top-3'} right-3 z-10`}>
            <SaveButton listingId={listing.id} size="sm" />
          </div>
        )}
        
        {imageCount > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-medium px-2.5 py-1 rounded-lg z-10 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {imageCount}
          </div>
        )}
        
        {hasImage ? (
          <Image 
            src={displayImage!} 
            alt={altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="h-full w-full bg-gray-300" />
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[#1A202C] text-lg mb-1 line-clamp-2 group-hover:text-[#4F7CFF] transition-colors">
          {listing.title}
        </h3>
        
        {/* Category Tag */}
        {listing.category && (
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#718096]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span className="text-sm text-[#718096]">{listing.category.name}</span>
          </div>
        )}
        
        {/* Price and Seller */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[#4F7CFF]">
            {price}
          </div>
          
          {/* Seller Avatar and Name */}
          {listing.seller && (
            <div className="flex items-center gap-2">
              {listing.seller && 'name' in listing.seller && listing.seller.name ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-[#4A5568] font-medium max-w-[100px] truncate">
                    {listing.seller.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

