import { prisma } from '../../../lib/db'
import ListingForm from '../../../components/ListingForm'
import BottomNav from '../../../components/BottomNav'

export default async function PostPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <main className="mx-auto max-w-2xl pb-20">
      <h1 className="mb-4 text-2xl font-semibold">Post</h1>
      <ListingForm categories={categories} />
      <BottomNav />
    </main>
  )
}
