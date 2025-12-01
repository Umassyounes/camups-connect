import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"

type RouteParams = {
  params: Promise<{ id: string }>
}

// DELETE /api/testimonials/[id] - Delete a testimonial (admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Authentication required
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Rate limiting
    const rateLimitIdentifier = getRateLimitIdentifier(req, "testimonials:delete", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.STRICT)
    if (rateLimitResponse) return rateLimitResponse

    const { id } = await params
    const testimonialId = parseInt(id)
    
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 })
    }

    // Check if user is admin or moderator
    const supabase = await sbServer()
    const { data: profile, error: profileError } = await supabase
      .from('Profile')
      .select('role')
      .eq('supabaseId', user.supabaseId)
      .single()

    const userRole = profile?.role?.toUpperCase()
    
    if (!profile || (userRole !== 'ADMIN' && userRole !== 'MODERATOR')) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Delete the testimonial
    const { error } = await supabase
      .from('Testimonial')
      .delete()
      .eq('id', testimonialId)

    if (error) {
      console.error("DELETE /api/testimonials/[id] error:", error)
      return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
    }

    return NextResponse.json({ message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
