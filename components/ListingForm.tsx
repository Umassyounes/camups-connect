'use client'
import { useState } from 'react'

export default function ListingForm({ categories }: { categories: { id: number; name: string }[] }) {
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    const res = await fetch('/api/listings', { method: 'POST', body: JSON.stringify(data) })
    if (res.ok) window.location.href = '/'
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input name="title" placeholder="Title" required className="w-full rounded-xl border p-3" />
      <textarea name="description" placeholder="Description" required className="w-full rounded-xl border p-3" rows={5} />
      <div className="grid grid-cols-2 gap-3">
        <input name="price" type="number" step="0.01" placeholder="Price (USD)" required className="rounded-xl border p-3" />
        <select name="condition" className="rounded-xl border p-3">
          <option value="NEW">New</option><option value="LIKE_NEW">Like New</option>
          <option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="USED">Used</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select name="categoryId" className="rounded-xl border p-3">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="imageUrl" placeholder="Image URL (optional)" className="rounded-xl border p-3" />
      </div>
      <button disabled={loading} className="rounded-xl bg-black px-5 py-3 text-white">
        {loading ? 'Creating…' : 'Create Listing'}
      </button>
    </form>
  )
}
