import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { Category: true, seller: true },
  })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(listing)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const contentType = req.headers.get('content-type') || ''
  let data: any = {}
  if (contentType.includes('application/json')) data = await req.json()
  else {
    const form = await req.formData()
    if (form.get('markSold')) data.isSold = true
  }
  const listing = await prisma.listing.update({ where: { id }, data })
  return NextResponse.json(listing)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await prisma.listing.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
