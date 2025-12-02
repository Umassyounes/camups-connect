import { NextRequest, NextResponse } from 'next/server'
import { sbServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await sbServer()

    const { data, error } = await supabase
      .from('Testimonial')
      .select('*')
      .eq('isApproved', true)
      .order('createdAt', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
    }

    return NextResponse.json({ testimonials: data })
  } catch (error) {
    console.error('Testimonials GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // ⚠️ Authentication required to leave a review
    const authSupabase = await sbServer()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 })
    }

    const { name, rating, comment } = await req.json()

    // Validation
    if (!name || !rating || !comment) {
      return NextResponse.json({ error: 'Name, rating, and comment are required' }, { status: 400 })
    }

    if (typeof name !== 'string' || name.length > 50) {
      return NextResponse.json({ error: 'Name must be 50 characters or less' }, { status: 400 })
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (typeof comment !== 'string' || comment.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or less' }, { status: 400 })
    }

    // 🛡️ Content Moderation using Sightengine
    const moderationResponse = await fetch(
      `https://api.sightengine.com/1.0/text/check.json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          text: `${name}\n${comment}`,
          mode: 'standard',
          lang: 'en',
          categories: 'drug,medical,extremism,weapon,spam,violence,self-harm',
          api_user: process.env.SIGHTENGINE_API_USER!,
          api_secret: process.env.SIGHTENGINE_API_SECRET!,
        }),
      }
    )

    const moderation = await moderationResponse.json()
    console.log('🛡️ Testimonial moderation result:', moderation)

    // Check for spam or inappropriate content
    const spamScore = moderation.spam?.prob || 0
    const profanityScore = moderation.profanity?.prob || 0
    const linkScore = moderation.link?.prob || 0

    // Reject if spam/profanity/links detected
    if (spamScore > 0.5 || profanityScore > 0.7 || linkScore > 0.7) {
      console.log('❌ Testimonial rejected - moderation failed')
      return NextResponse.json({
        error: 'Your review contains inappropriate content or spam',
      }, { status: 400 })
    }

    // Use service role client to bypass RLS for public testimonial submissions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabase
      .from('Testimonial')
      .insert({
        name,
        rating,
        comment,
        isApproved: true, // Auto-approved after passing moderation
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 })
    }

    return NextResponse.json({ testimonial: data }, { status: 201 })
  } catch (error) {
    console.error('Testimonials POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
