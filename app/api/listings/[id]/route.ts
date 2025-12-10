import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { withDerivedProFlag } from "@/lib/utils/pro"
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 API: Fetching listing with ID:', id, 'Type:', typeof id)
    const supabase = await sbServer()

    const { data: listing, error } = await supabase
      .from('Listing')
      .select(`
        *,
        category:Category(*),
        seller:Profile!Listing_sellerId_fkey(id, name, avatarUrl, createdAt, isVerified, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts)
      `)
      .eq('id', parseInt(id))
      .single()

    console.log('🔍 API: Query result - error:', error, 'listing:', listing ? `Found listing ${listing.id}` : 'null')

    if (error || !listing) {
      console.error('❌ API: Listing not found. Error:', error)
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const normalizedListing = listing ? {
      ...listing,
      seller: withDerivedProFlag(listing.seller)
    } : null

    return NextResponse.json({ data: normalizedListing })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser.profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const supabase = await sbServer()

    // Verify ownership
    const { data: listing } = await supabase
      .from('Listing')
      .select('sellerId')
      .eq('id', parseInt(id))
      .single()

    console.log('🔍 Update listing authorization check:', {
      listingId: id,
      listingSellerId: listing?.sellerId,
      listingSellerIdType: typeof listing?.sellerId,
      currentUserProfileId: currentUser.profile?.id,
      currentUserProfileIdType: typeof currentUser.profile?.id,
      matches: listing?.sellerId === currentUser.profile?.id,
      strictEqual: listing?.sellerId === currentUser.profile?.id,
      looseEqual: listing?.sellerId == currentUser.profile?.id
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or moderator
    const userRole = currentUser.profile.role?.toUpperCase()
    const isAdminOrModerator = userRole === 'ADMIN' || userRole === 'MODERATOR'
    const isOwner = Number(listing.sellerId) === Number(currentUser.profile.id)

    // Compare using Number() to handle potential type mismatches
    // Allow admins and moderators to edit any listing
    if (!isOwner && !isAdminOrModerator) {
      return NextResponse.json(
        { error: 'Not authorized to update this listing' },
        { status: 403 }
      )
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    }
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.priceCents !== undefined) updateData.priceCents = body.priceCents
    if (body.condition !== undefined) updateData.condition = body.condition
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.campus !== undefined) updateData.campus = body.campus
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.images !== undefined) updateData.images = body.images
    if (body.imageCount !== undefined) updateData.imageCount = body.imageCount
    if (body.isSold !== undefined) updateData.isSold = body.isSold

    // For admin/moderator edits on others' listings, use service role to bypass RLS
    let updateClient = supabase
    if (!isOwner && isAdminOrModerator) {
      console.log('🔓 Using service role for admin listing update')
      const { createClient } = await import('@supabase/supabase-js')
      updateClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    // Update listing
    const { data: updatedListing, error } = await updateClient
      .from('Listing')
      .update(updateData)
      .eq('id', parseInt(id))
      .select(`
        *,
        category:Category(*),
        seller:Profile!Listing_sellerId_fkey(id, name, avatarUrl, createdAt, isVerified, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      )
    }

    const normalizedListing = updatedListing ? {
      ...updatedListing,
      seller: withDerivedProFlag(updatedListing.seller)
    } : null

    return NextResponse.json({ data: normalizedListing })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser.profile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await sbServer()

    // Verify ownership or admin/moderator status
    const { data: listing } = await supabase
      .from('Listing')
      .select('sellerId')
      .eq('id', parseInt(id))
      .single()

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner
    const isOwner = Number(listing.sellerId) === Number(currentUser.profile.id)
    
    // Check if user is admin or moderator
    const userRole = currentUser.profile.role?.toUpperCase()
    const isAdminOrModerator = userRole === 'ADMIN' || userRole === 'MODERATOR'

    console.log('🔍 Delete listing authorization check:', {
      listingId: id,
      listingSellerId: listing?.sellerId,
      currentUserProfileId: currentUser.profile?.id,
      userRole: userRole,
      isOwner: isOwner,
      isAdminOrModerator: isAdminOrModerator,
      authorized: isOwner || isAdminOrModerator
    })

    // Allow deletion if user is owner OR admin/moderator
    if (!isOwner && !isAdminOrModerator) {
      return NextResponse.json(
        { error: 'Not authorized to delete this listing' },
        { status: 403 }
      )
    }

    // For admin/moderator deletions, use service role to bypass RLS
    // For owner deletions, use regular client
    let deleteClient = supabase
    if (!isOwner && isAdminOrModerator) {
      console.log('🔓 Using service role for admin deletion')
      deleteClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    }

    // Delete listing
    const { error, data } = await deleteClient
      .from('Listing')
      .delete()
      .eq('id', parseInt(id))
      .select()

    console.log('🗑️ Delete result:', { error, deleted: data?.length || 0, listingId: id })

    if (error) {
      console.error('❌ Delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, deleted: data?.length || 0 })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
