/**
 * API Route: /api/reviews
 * Fetch all reviews/ratings from the platform
 * Public endpoint - anyone can view reviews
 */

import { NextRequest, NextResponse } from 'next/server'
import { sbServer } from '@/lib/supabase/server'

export const dynamic = "force-dynamic"

// GET /api/reviews - Get all reviews with optional filters
export async function GET(req: NextRequest) {
  try {
    const supabase = await sbServer()
    const { searchParams } = new URL(req.url)
    
    // Optional filters
    const minScore = searchParams.get('minScore')
    const revieweeId = searchParams.get('revieweeId')
    const reviewerId = searchParams.get('reviewerId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query - fetch ratings with related profile and listing info
    let query = supabase
      .from('Rating')
      .select(`
        *,
        reviewer:Profile!Rating_reviewerId_fkey(id, name, avatarUrl, proStatus),
        reviewee:Profile!Rating_revieweeId_fkey(id, name, avatarUrl, proStatus),
        transaction:Transaction(
          id,
          listing:Listing(id, title, imageUrl, images)
        )
      `)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (minScore) {
      query = query.gte('score', parseInt(minScore))
    }
    
    if (revieweeId) {
      query = query.eq('revieweeId', parseInt(revieweeId))
    }
    
    if (reviewerId) {
      query = query.eq('reviewerId', parseInt(reviewerId))
    }
    
    const { data: reviews, error, count } = await query
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('Rating')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      reviews: reviews || [],
      total: totalCount || 0,
      limit,
      offset
    })
  } catch (err) {
    console.error('Unexpected error fetching reviews:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
