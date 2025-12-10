import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';

// GET /api/profile/[id] - Get public profile by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = parseInt(params.id);
    
    if (isNaN(profileId)) {
      return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
    }

    const supabase = await sbServer();

    // Fetch basic profile info (public data only)
    const { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('id, name, avatarUrl, bio, createdAt, isSuspended')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Don't show suspended users
    if (profile.isSuspended) {
      return NextResponse.json({ error: 'This user has been suspended' }, { status: 403 });
    }

    // Get listings count
    const { count: listingsCount } = await supabase
      .from('Listing')
      .select('id', { count: 'exact', head: true })
      .eq('sellerId', profileId)
      .eq('status', 'active');

    // Get events count
    const { count: eventsCount } = await supabase
      .from('Event')
      .select('id', { count: 'exact', head: true })
      .eq('hostId', profileId);

    // Get reviews/ratings
    const { data: reviews } = await supabase
      .from('TransactionRating')
      .select('rating')
      .eq('ratedUserId', profileId);

    const reviewsCount = reviews?.length || 0;
    const averageRating = reviewsCount > 0 
      ? reviews!.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount 
      : null;

    return NextResponse.json({
      data: {
        id: profile.id,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        createdAt: profile.createdAt,
        listingsCount: listingsCount || 0,
        eventsCount: eventsCount || 0,
        reviewsCount,
        averageRating,
      }
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
