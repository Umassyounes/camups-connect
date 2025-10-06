import { prisma } from '../../lib/db'
import BottomNav from '../../components/BottomNav'

export default async function ProfilePage() {
  const user = await prisma.user.findFirst({ where: { id: 1 } }) // TODO: replace with session user

  return (
    <main className="mx-auto max-w-2xl pb-20">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div>
          <h1 className="text-2xl font-bold">{user?.name || 'Demo User'}</h1>
          <div className="text-sm text-gray-600">
            @{(user?.email || 'demo@umb.edu').split('@')[0]}
          </div>
        </div>
      </div>

      <div className="divide-y rounded-2xl border bg-white shadow-sm">
        <a href="/my" className="block px-4 py-3 hover:bg-gray-50">My Listings</a>
        <a href="#" className="block px-4 py-3 hover:bg-gray-50">Saved Items</a>
        <form action="/api/logout" method="post">
          <button className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50">Logout</button>
        </form>
      </div>

      <BottomNav />
    </main>
  )
}
