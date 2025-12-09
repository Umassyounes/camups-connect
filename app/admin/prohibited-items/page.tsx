'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProhibitedItem {
  id: number
  pattern: string
  type: 'keyword' | 'phrase' | 'regex'
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export default function ProhibitedItemsPage() {
  const router = useRouter()
  const [items, setItems] = useState<ProhibitedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ProhibitedItem | null>(null)
  const [formData, setFormData] = useState({
    pattern: '',
    type: 'keyword' as 'keyword' | 'phrase' | 'regex',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: '',
    description: '',
  })

  // Filters
  const [typeFilter, setTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('true')

  useEffect(() => {
    fetchItems()
  }, [typeFilter, severityFilter, categoryFilter, activeFilter])

  async function fetchItems() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (severityFilter) params.append('severity', severityFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (activeFilter) params.append('isActive', activeFilter)

      const res = await fetch(`/api/admin/prohibited-items?${params}`)
      if (res.status === 403) {
        alert('You do not have admin access')
        router.push('/')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch prohibited items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    try {
      const url = editingItem 
        ? `/api/admin/prohibited-items`
        : `/api/admin/prohibited-items`
      
      const method = editingItem ? 'PATCH' : 'POST'
      const body = editingItem
        ? { id: editingItem.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save item')
      }

      alert(editingItem ? 'Item updated!' : 'Item added!')
      setShowAddModal(false)
      setEditingItem(null)
      setFormData({
        pattern: '',
        type: 'keyword',
        severity: 'medium',
        category: '',
        description: '',
      })
      fetchItems()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this prohibited item?')) return

    try {
      const res = await fetch(`/api/admin/prohibited-items?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete item')
      }

      alert('Item deleted!')
      fetchItems()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleToggleActive(item: ProhibitedItem) {
    try {
      const res = await fetch('/api/admin/prohibited-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update item')
      }

      fetchItems()
    } catch (error: any) {
      alert(error.message)
    }
  }

  function openEditModal(item: ProhibitedItem) {
    setEditingItem(item)
    setFormData({
      pattern: item.pattern,
      type: item.type,
      severity: item.severity,
      category: item.category,
      description: item.description || '',
    })
    setShowAddModal(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const uniqueCategories = Array.from(new Set(items.map(i => i.category))).sort()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            🚫 Prohibited Items Management
          </h1>
          <p className="text-foreground-secondary">
            Manage banned keywords, phrases, and patterns for content filtering.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null)
            setFormData({
              pattern: '',
              type: 'keyword',
              severity: 'medium',
              category: '',
              description: '',
            })
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
        >
          + Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">All Types</option>
              <option value="keyword">Keyword</option>
              <option value="phrase">Phrase</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Prohibited Items ({items.length})</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-foreground-secondary">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-foreground-secondary">
            No prohibited items found with current filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Pattern</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-background-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-foreground">{item.pattern}</div>
                      {item.description && (
                        <div className="text-xs text-foreground-secondary mt-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-background-secondary text-foreground-secondary rounded">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          item.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-primary hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 dark:text-red-400 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-lg w-full p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              {editingItem ? 'Edit Prohibited Item' : 'Add Prohibited Item'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Pattern *</label>
                <input
                  type="text"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., weapon, drugs, scam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="keyword">Keyword</option>
                  <option value="phrase">Phrase</option>
                  <option value="regex">Regex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Severity *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="e.g., Weapons, Drugs, Scams"
                  list="categories"
                />
                <datalist id="categories">
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-background-secondary text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

