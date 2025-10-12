import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sbServer } from "@/lib/supabase/server"

/**
 * Expected Prisma model (adapt as needed):
 *
 * model Listing {
 *   id         Int      @id @default(autoincrement())
 *   title      String
 *   description String?
 *   imageUrl   String?
 *   category   String?
 *   priceCents Int
 *   sellerId   String     // Supabase user id
 *   createdAt  DateTime @default(now())
 * }
 */

// ------------------- GET /api/listings -------------------
// Query params (all optional):
//   q           - text search in title
//   category    - exact category string
//   minPrice    - dollars (e.g., 10)
//   maxPrice    - dollars (e.g., 200)
//   page        - 1-based page number (default 1)
//   limit       - page size (default 20)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const q = searchParams.get("q") ?? undefined
    const category = searchParams.get("category") ?? undefined

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      50
    )
    const skip = (page - 1) * limit

    // prices are provided in dollars in query; convert to cents for DB
    const minPriceCents = searchParams.get("minPrice")
      ? Math.round(parseFloat(searchParams.get("minPrice")!) * 100)
      : undefined
    const maxPriceCents = searchParams.get("maxPrice")
      ? Math.round(parseFloat(searchParams.get("maxPrice")!) * 100)
      : undefined

    const where: any = {}

    if (q) {
      where.title = { contains: q, mode: "insensitive" }
    }
    if (category) {
      where.category = category
    }
    if (minPriceCents != null || maxPriceCents != null) {
      where.priceCents = {}
      if (minPriceCents != null) where.priceCents.gte = minPriceCents
      if (maxPriceCents != null) where.priceCents.lte = maxPriceCents
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error("GET /api/listings error:", err)
    return NextResponse.json(
      { error: "Failed to load listings" },
      { status: 500 }
    )
  }
}

// ------------------- POST /api/listings -------------------
// Body JSON:
//   {
//     "title": string,
//     "description": string (optional),
//     "imageUrl": string (optional),
//     "category": string (optional),
//     "price": number  // dollars, e.g. 45.99
//   }
export async function POST(req: Request) {
  try {
    // Require user (Supabase)
    const supabase = sbServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Basic validation (adjust to your UI)
    const title = (body.title ?? "").toString().trim()
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const priceDollars = Number(body.price)
    if (Number.isNaN(priceDollars) || priceDollars < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      )
    }

    const priceCents = Math.round(priceDollars * 100)

    const created = await prisma.listing.create({
      data: {
        title,
        description: body.description ?? "",
        imageUrl: body.imageUrl ?? null,
        category: body.category ?? null,
        priceCents,
        sellerId: user.id, // store Supabase user id (string)
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error("POST /api/listings error:", err)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}
