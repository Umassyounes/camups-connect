import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const categoryId = searchParams.get('categoryId')
  const min = searchParams.get('min')
  const max = searchParams.get('max')

  const where: any = {}
  if (q) where.OR = [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
  ]
  if (categoryId) where.categoryId = Number(categoryId)
  if (min || max) where.priceCents = {
    gte: min ? Math.round(Number(min) * 100) : undefined,
    lte: max ? Math.round(Number(max) * 100) : undefined,
  }

  const listings = await prisma.listing.findMany({
    where, orderBy: { createdAt: 'desc' }, include: { category: true, seller: true }
  })
  return NextResponse.json(listings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const priceCents = Math.round(parseFloat(body.price) * 100)
  const listing = await prisma.listing.create({
    data: {
      title: body.title,
      description: body.description,
      priceCents,
      imageUrl: body.imageUrl || null,
      condition: body.condition || 'USED',
      categoryId: Number(body.categoryId),
      sellerId: 1, // TODO: replace with session user
    },
  })
  return NextResponse.json({ id: listing.id }, { status: 201 })
}
