import { NextRequest, NextResponse } from "next/server"
import { sbServer } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-middleware"
import { validateRequest, createListingSchema, type CreateListingInput } from "@/lib/validation-schemas"
import { rateLimit, RateLimits, getRateLimitIdentifier } from "@/lib/rate-limit"
import { moderateText, calculateSpamScore, shouldAutoReject, shouldFlagForReview } from "@/lib/moderation"
import { detectNSFW } from "@/lib/nsfw-detection"
import { withDerivedProFlag } from "@/lib/utils/pro"

// CREATE a listing
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const rateLimitIdentifier = getRateLimitIdentifier(req, "listings:create", user.id)
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.STRICT)
    if (rateLimitResponse) return rateLimitResponse

    const validation = await validateRequest(req, createListingSchema)
    if ("error" in validation) {
      return NextResponse.json({ error: validation.error, details: validation.details }, { status: 400 })
    }
    const payload = validation.data as CreateListingInput
    const { title, description, priceCents, condition, categoryId, imageUrl, images = [], campus, paymentMethods } = payload

    const normalizedImages = images && images.length > 0 ? images : imageUrl ? [imageUrl] : []

    const titleModeration = moderateText(title)
    if (shouldAutoReject(titleModeration)) {
      return NextResponse.json(
        { error: "Your listing title contains inappropriate or spam content", reasons: titleModeration.reasons },
        { status: 400 }
      )
    }
    const descriptionModeration = moderateText(description)
    if (shouldAutoReject(descriptionModeration)) {
      return NextResponse.json(
        { error: "Your listing description contains inappropriate or spam content", reasons: descriptionModeration.reasons },
        { status: 400 }
      )
    }

    const spamScore = calculateSpamScore({ title, description, priceCents })
    if (spamScore >= 50) {
      return NextResponse.json(
        {
          error: "Your listing appears to be spam or violates our community guidelines",
          reasons: [...titleModeration.reasons, ...descriptionModeration.reasons],
        },
        { status: 400 }
      )
    }

    // NSFW Image Detection (multiple images supported)
    let nsfwReasons: string[] = []
    let shouldRejectNSFW = false
    for (const img of normalizedImages) {
      if (!img) continue
      const nsfwResult = await detectNSFW(img)
      if (nsfwResult.shouldReject || nsfwResult.confidence >= 0.5) {
        shouldRejectNSFW = true
        const supabase = await sbServer()
        await supabase.from("FlaggedContent").insert({
          contentType: "listing",
          contentId: 0,
          userId: user.id,
          reason: `NSFW image rejected: ${nsfwResult.categories.join(", ")}`,
          severity: nsfwResult.confidence >= 0.7 ? "high" : "medium",
          status: "rejected",
          source: "auto",
          details: {
            nsfwScore: nsfwResult.confidence,
            categories: nsfwResult.categories,
            imageUrl: img.substring(0, 200),
            title: title.substring(0, 100),
            description: description.substring(0, 200),
            rejectedAt: new Date().toISOString(),
          },
        })

        return NextResponse.json(
          {
            error: "Image contains inappropriate content (NSFW detected)",
            categories: nsfwResult.categories,
            confidence: nsfwResult.confidence,
          },
          { status: 400 }
        )
      }

      if (nsfwResult.isNSFW) {
        nsfwReasons.push(`Image flagged: ${nsfwResult.categories.join(", ")}`)
      }
    }

    const needsReview =
      spamScore >= 30 ||
      shouldFlagForReview(titleModeration) ||
      shouldFlagForReview(descriptionModeration) ||
      nsfwReasons.length > 0

    const supabase = await sbServer()

    if (categoryId) {
      const { data: category } = await supabase.from("Category").select("id").eq("id", categoryId).single()
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const { data: sellerPaymentMethods } = await supabase
      .from("PaymentMethod")
      .select("methodType, isActive")
      .eq("userId", user.id)
      .eq("isActive", true)

    const availableMethods = new Set((sellerPaymentMethods || []).map((pm: any) => pm.methodType))
    const invalidSelections = paymentMethods.filter((method) => !availableMethods.has(method))
    if (invalidSelections.length > 0) {
      return NextResponse.json(
        { error: `Some payment methods are not active on your account: ${invalidSelections.join(", ")}` },
        { status: 400 }
      )
    }

    const { data: listing, error } = await supabase
      .from("Listing")
      .insert({
        title,
        description,
        priceCents,
        categoryId: categoryId ?? null,
        condition,
        imageUrl: normalizedImages[0] ?? null,
        images: normalizedImages,
        imageCount: normalizedImages.length,
        campus: campus ?? null,
        sellerId: user.id,
        createdAt: now,
        updatedAt: now,
      })
      .select(
        `
        *,
        category:Category(*),
        seller:Profile!Listing_sellerId_fkey(id, name, avatarUrl, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts)
      `
      )
      .single()

    if (error || !listing) {
      console.error("Failed to create listing:", error)
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
    }

    if (needsReview) {
      const severity = spamScore >= 60 ? "high" : spamScore >= 45 ? "medium" : "low"
      const reasons = [
        ...titleModeration.reasons,
        ...descriptionModeration.reasons,
        ...nsfwReasons,
        spamScore >= 30 ? `Spam score: ${spamScore}` : null,
      ].filter(Boolean)

      const { error: flagError } = await supabase
        .from("FlaggedContent")
        .insert({
          contentType: "listing",
          contentId: listing.id,
          userId: user.id,
          reason: reasons.join(", "),
          severity,
          status: "pending",
          source: "auto",
          details: {
            spamScore,
            titleModeration,
            descriptionModeration,
            nsfwCheck: nsfwReasons.length > 0,
            title: title.substring(0, 100),
            description: description.substring(0, 200),
            imageUrl: normalizedImages[0] ? normalizedImages[0].substring(0, 200) : null,
          },
          createdAt: now,
        })
        .select()
        .single()

      if (flagError) {
        console.error("Failed to create FlaggedContent entry:", flagError)
      }
    }

    return NextResponse.json(
      {
        data: {
          ...listing,
          seller: withDerivedProFlag(listing.seller),
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("POST /api/listings failed:", err)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}

// READ listings (kept for completeness)
export async function GET(req: NextRequest) {
  try {
    const rateLimitIdentifier = getRateLimitIdentifier(req, "listings:read")
    const rateLimitResponse = rateLimit(rateLimitIdentifier, RateLimits.LENIENT)
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(req.url)
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 50)
    const skip = (page - 1) * limit

    const supabase = await sbServer()
    const q = searchParams.get("q")
    const category = searchParams.get("category")
    const status = searchParams.get("status")?.toLowerCase()
    
    let query = supabase
      .from('Listing')
      .select(`
        *,
        category:Category(*),
        seller:Profile!Listing_sellerId_fkey(id, name, avatarUrl, proStatus, proPlan, proHomepageEligible, proUnlimitedBoosts)
      `, { count: 'exact' })

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    if (category) {
      const { data: categoryData } = await supabase
        .from('Category')
        .select('id')
        .or(`name.ilike.${category},slug.eq.${category.toLowerCase()}`)
        .single()
      
      if (categoryData) {
        query = query.eq('categoryId', categoryData.id)
      }
    }

    if (status === "active") {
      query = query.eq('isSold', false)
    } else if (status === "sold") {
      query = query.eq('isSold', true)
    }

    const { data: items, error, count } = await query
      .order('boostedUntil', { ascending: false, nullsFirst: false })
      .order('createdAt', { ascending: false })
      .range(skip, skip + limit - 1)

    if (error) {
      console.error("GET /api/listings failed:", error)
      return NextResponse.json({ error: "Failed to load listings" }, { status: 500 })
    }

    const total = count ?? 0

    const normalizedItems = (items || []).map((item: any) => ({
      ...item,
      seller: withDerivedProFlag(item.seller),
    }))

    return NextResponse.json({
      data: normalizedItems,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error("GET /api/listings failed:", e)
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 })
  }
}
