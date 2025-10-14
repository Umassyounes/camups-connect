import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sbServer } from "@/lib/supabase/server";
import { z } from "zod";

const prisma = new PrismaClient();

const CreateListingSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || null),
  // allow either priceCents or price (in dollars)
  priceCents: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  // prefer categoryId (Int). If you only have slugs client-side, send categorySlug instead.
  categoryId: z.number().int().positive().optional(),
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

    // 4) Compute priceCents
    const priceCents =
      typeof data.priceCents === "number"
        ? data.priceCents
        : typeof data.price === "number"
          ? Math.round(data.price * 100)
          : null;

    if (priceCents == null) {
      return NextResponse.json(
        { error: "priceCents or price is required" },
        { status: 400 }
      );
    }

    // 5) Resolve category
    let categoryId: number | null = null;
    if (typeof data.categoryId === "number") {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
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
        ...(categoryId ? { categoryId } : {}),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/listings error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

