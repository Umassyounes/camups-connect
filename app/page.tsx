import { sbServer } from "@/lib/supabase/server"
import ListingCard from "@/components/ListingCard"
import SearchBar from "@/components/SearchBar"
import FilterSortButtons from "@/components/FilterSortButtons"
import type { Database } from "@/lib/supabase/databaseTypes"
import { isProfilePro } from "@/lib/utils/pro"

type Listing = Database['public']['Tables']['Listing']['Row']
type Category = Database['public']['Tables']['Category']['Row']
type ListingWithCategory = Listing & { category: Category | null }

export const dynamic = "force-dynamic"

export default async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const categoryFilter = params.category as string | undefined
  const sortBy = params.sort as string | undefined
  const proOnly = params.pro === 'true'

  let listings: any[] = []
  let categories: Category[] = []

  try {
    const supabase = await sbServer()

    // Fetch categories only if needed for future filter modal (not shown on page directly anymore)
    const { data: categoryData } = await supabase
      .from('Category')
      .select('id, name, slug')
      .order('name', { ascending: true })
    categories = categoryData || []

    // Build query - now includes seller profile to check Pro status
    let query = supabase
      .from('Listing')
      .select(`
        *,
        category:Category(*),
        seller:Profile!Listing_sellerId_fkey(id, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts)
      `)
      .limit(30)
    
    // Filter by category if specified and not "All"
    if (categoryFilter && categoryFilter.toLowerCase() !== "all") {
      const normalizedFilter = categoryFilter.toLowerCase()
      const categoryMatch = categories.find((cat) =>
        cat.slug?.toLowerCase() === normalizedFilter ||
        cat.name?.toLowerCase() === normalizedFilter
      )

      if (categoryMatch) {
        query = query.eq('categoryId', categoryMatch.id)
      }
    }

    // Apply sorting (Pro users always come first)
    if (sortBy === "price_low") {
      query = query.order('priceCents', { ascending: true })
    } else if (sortBy === "price_high") {
      query = query.order('priceCents', { ascending: false })
    } else {
      query = query.order('createdAt', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error
    
    // Prioritize Pro member listings at the top (featured placement)
    const rawListings = data || []
    
    // Apply Pro filter if requested
    const sellerIsPro = (listing: any) => isProfilePro(listing?.seller)

    const filteredListings = proOnly
      ? rawListings.filter((l: any) => sellerIsPro(l) && l.seller?.proHomepageEligible)
      : rawListings
    
    const proListings = filteredListings.filter((l: any) => 
      sellerIsPro(l) && l.seller?.proHomepageEligible && !l.isSold
    )
    const regularListings = filteredListings.filter((l: any) => 
      !sellerIsPro(l) || !l.seller?.proHomepageEligible || l.isSold
    )
    
    listings = [...proListings, ...regularListings]
  } catch (err) {
    console.error('Error loading listings:', err)
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Campus Connect</h1>
        <p className="rounded-lg border bg-red-50 p-4 text-sm">
          Could not load listings. Check your database connection and server logs.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-20 bg-[#F5F7FA]">
      {/* Hero + Search */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-3 md:px-6 py-6 md:py-8 space-y-4 md:space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A202C] mb-1">
              {proOnly ? '🌟 Pro Members' : 'UMB Marketplace'}
            </h1>
            <p className="text-sm md:text-base text-[#718096]">
              {proOnly ? 'Exclusive listings from verified Pro sellers' : 'Verified listings from trusted students'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 md:p-6 text-center">
            <p className="text-sm md:text-base text-gray-600 font-medium">📢 Sponsored Content Coming Soon</p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex-1 w-full">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <SearchBar />
              </div>
            </div>
            <FilterSortButtons />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-8">
        {listings.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-foreground-secondary">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4">??</div>
            <p className="text-lg md:text-xl text-foreground mb-1 md:mb-2">No listings found</p>
            <p className="text-xs md:text-sm">{proOnly ? 'No Pro listings available' : 'Be the first to post an item!'}</p>
          </div>
        ) : (
          <>
            {!proOnly && listings.some((l: any) => isProfilePro(l.seller) && l.seller?.proHomepageEligible) && (
              <div className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm text-foreground-secondary">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 md:px-3 py-1 md:py-1.5 rounded-full font-medium w-fit">
                  <span className="text-sm md:text-base">?</span>
                  <span className="text-xs md:text-sm">Featured Pro Sellers</span>
                </span>
                <span className="hidden sm:inline">-</span>
                <span className="text-xs md:text-sm">Pro members appear first in search results</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4 md:gap-6 mt-4 md:mt-6">
              {listings.map((listing) => (
                <div key={listing.id} className="animate-fade-in">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Monetization section removed - not user-facing */}
      </div>
    </main>
  )
}
