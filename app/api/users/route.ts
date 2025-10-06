import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users  -> list users
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// POST /api/users  -> create a user { name, email }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    const user = await prisma.user.create({ data: { name, email } });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
