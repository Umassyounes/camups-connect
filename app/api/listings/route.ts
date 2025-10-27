import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sbServer } from "@/lib/supabase/server";
import { z } from "zod";

const CreateListingSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || null),
   // allow either priceCents or price (in dollars)
  priceCents: z
    .preprocess(
      value => (value === "" ? undefined : value),
      z.coerce.number().int().nonnegative()
    )
    .optional(),
  price: z
    .preprocess(
      value => (value === "" ? undefined : value),
      z.coerce.number().nonnegative()
    )
    .optional(),
  // prefer categoryId (Int). If you only have slugs client-side, send categorySlug instead.
  categoryId: z
    .preprocess(
      value => (value === "" ? undefined : value),
      z.coerce.number().int().positive()
    )
    .optional(),
  categorySlug: z.string().min(1).optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "USED"]).default("USED"),
  campus: z.string().default("UMass Boston"),
});

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      // include category if you want it in responses:
      // category: { select: { id: true, name: true, slug: true } },
    },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  try {
    // 1) Auth
    const supabase = sbServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2) Map Supabase → local User
    const localUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {},
      create: {
        supabaseId: user.id,
        email: user.email ?? `no-email-${user.id}@example.local`,
        name: (user.user_metadata as any)?.full_name ?? "User",
      },
    });

    // 3) Validate body
    const json = await req.json();
    const parsed = CreateListingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const parsedPriceCents =
      typeof data.priceCents === "number" && !Number.isNaN(data.priceCents)
        ? data.priceCents
        : undefined;
    const parsedPrice =
      typeof data.price === "number" && !Number.isNaN(data.price)
        ? data.price
        : undefined;
    const parsedCategoryId =
      typeof data.categoryId === "number" && !Number.isNaN(data.categoryId)
        ? data.categoryId
        : undefined;

    // 4) Compute priceCents
    const priceCents =
      typeof parsedPriceCents === "number"
        ? parsedPriceCents
        : typeof parsedPrice === "number"
          ? Math.round(parsedPrice * 100)
          : null;

    if (priceCents == null) {
      return NextResponse.json(
        { error: "priceCents or price is required" },
        { status: 400 }
      );
    }

    // 5) Resolve category
    let categoryId: number | null = null;
    if (typeof parsedCategoryId === "number") {
      const cat = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
      if (!cat) return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
      categoryId = cat.id;
    } else if (data.categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
      if (!cat) return NextResponse.json({ error: "Invalid categorySlug" }, { status: 400 });
      categoryId = cat.id;
    }

    // 6) Create listing
    const created = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        condition: data.condition,
        campus: data.campus,
        priceCents,
        sellerId: localUser.id,
        ...(categoryId !== null ? { categoryId } : {}),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}