"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const MAX_IMAGES = 5

type Listing = {
  id: number
  title: string
  description: string
  priceCents: number
  condition: string
  imageUrl: string | null
  images: string[]
  campus: string | null
  isSold: boolean
  sellerId: number
  category: { id: number; name: string } | null
}

type Category = {
  id: number
  name: string
}

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [listingId, setListingId] = useState<string | null>(null)
  const [descriptionLength, setDescriptionLength] = useState(0)
  
  // Image state
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()

  useEffect(() => {
    params.then(p => {
      setListingId(p.id)
      fetchListing(p.id)
      fetchCategories()
    })
  }, [params])

  async function fetchListing(id: string) {
    try {
      const res = await fetch(`/api/listings/${id}`)
      const data = await res.json()
      
      if (data.data) {
        setListing(data.data)
        setDescriptionLength(data.data.description?.length || 0)
        // Set existing images
        const images = data.data.images && data.data.images.length > 0 
          ? data.data.images 
          : data.data.imageUrl 
            ? [data.data.imageUrl] 
            : []
        setExistingImages(images)
      } else {
        setErrorMessage("Listing not found")
      }
    } catch (error) {
      console.error("Failed to fetch listing:", error)
      setErrorMessage("Failed to load listing")
    } finally {
      setFetchLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      if (data.data) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const totalImages = existingImages.length + newImages.length

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }

  function addImages(files: File[]) {
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    const remainingSlots = MAX_IMAGES - totalImages
    const filesToAdd = validFiles.slice(0, remainingSlots)

    if (filesToAdd.length === 0) {
      if (validFiles.length === 0) {
        alert('Please select valid image files')
      } else {
        alert(`Maximum ${MAX_IMAGES} images allowed`)
      }
      return
    }

    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
    setNewImages(prev => [...prev, ...filesToAdd])
    setNewImagePreviews(prev => [...prev, ...newPreviews])
  }

  function removeExistingImage(index: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addImages(files)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!listingId) return
    
    setLoading(true)
    setErrorMessage(null)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      // Upload new images
      const uploadedUrls: string[] = []
      for (const image of newImages) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', image)
        uploadFormData.append('type', 'listing')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}))
          setErrorMessage(`Upload failed: ${errorData.error || uploadRes.statusText}`)
          setLoading(false)
          return
        }

        const uploadData = await uploadRes.json()
        if (uploadData.data?.url) {
          uploadedUrls.push(uploadData.data.url)
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedUrls]

      const priceValue = formData.get('price')
      const parsedPrice = typeof priceValue === 'string' ? Number.parseFloat(priceValue) : NaN
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setErrorMessage('Please enter a valid, non-negative price')
        setLoading(false)
        return
      }

      const priceCents = Math.round(parsedPrice * 100)
      const title = formData.get('title')?.toString().trim() ?? ''
      const description = formData.get('description')?.toString().trim() ?? ''
      const condition = formData.get('condition')?.toString() ?? 'GOOD'
      const campusInput = formData.get('campus')?.toString().trim()
      const categoryIdRaw = formData.get('categoryId')?.toString()
      const categoryId = categoryIdRaw ? Number.parseInt(categoryIdRaw, 10) : null

      if (title.length < 3) {
        setErrorMessage("Title must be at least 3 characters long")
        setLoading(false)
        return
      }

      if (description.length < 10) {
        setErrorMessage("Description must be at least 10 characters long")
        setLoading(false)
        return
      }

      const payload = {
        title,
        description,
        condition,
        priceCents,
        categoryId: Number.isInteger(categoryId) ? categoryId : null,
        campus: campusInput ? campusInput : null,
        imageUrl: allImages[0] || null,
        images: allImages,
        imageCount: allImages.length,
      }

      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        router.push(`/listings/${listingId}`)
      } else {
        const error = await res.json()
        setErrorMessage(error.error || 'Failed to update listing')
      }
    } catch (error) {
      console.error("Failed to update listing:", error)
      setErrorMessage("Failed to update listing")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mb-4"></div>
          <p className="text-foreground-secondary">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (errorMessage && !listing) {
    return (
      <div className="text-center py-12 text-foreground-secondary">
        <p className="text-lg text-foreground">{errorMessage}</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-12 text-foreground-secondary">
        <p className="text-lg text-foreground">Listing not found</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <div className="text-sm text-foreground-secondary mb-4">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <Link href={`/listings/${listingId}`} className="hover:text-primary">Listing</Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <span className="text-foreground">Edit</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-center">Edit Listing</h1>

      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          name="title" 
          placeholder="Title" 
          required 
          defaultValue={listing.title}
          className="w-full rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground placeholder:text-muted-foreground focus:border-primary" 
        />
        
        <div>
          <textarea 
            name="description" 
            placeholder="Description" 
            required 
            defaultValue={listing.description}
            onChange={(e) => setDescriptionLength(e.target.value.length)}
            className="w-full rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground placeholder:text-muted-foreground focus:border-primary" 
            rows={5} 
          />
          <p className="mt-1 text-xs text-foreground-secondary">
            {descriptionLength} / 5000 characters (minimum 10 required)
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <input 
            name="price" 
            type="number" 
            step="0.01" 
            placeholder="Price (USD)" 
            required 
            defaultValue={(listing.priceCents / 100).toFixed(2)}
            className="rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground placeholder:text-muted-foreground focus:border-primary" 
          />
          <select 
            name="condition" 
            defaultValue={listing.condition}
            className="rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground focus:border-primary"
          >
            <option value="NEW">New</option>
            <option value="LIKE_NEW">Like New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select 
            name="categoryId" 
            defaultValue={listing.category?.id || ""}
            className="rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground focus:border-primary" 
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input 
            name="campus" 
            placeholder="Campus/Location (optional)" 
            defaultValue={listing.campus || ""}
            className="rounded-xl border border-border bg-[var(--input-bg)] p-3 text-foreground placeholder:text-muted-foreground focus:border-primary" 
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Product Images ({totalImages}/{MAX_IMAGES})
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img 
                    src={url} 
                    alt={`Existing ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-lg border-2 border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center hover:opacity-90 opacity-0 group-hover:opacity-100 transition shadow-lg"
                    title="Remove image"
                  >
                    ✕
                  </button>
                  {index === 0 && newImages.length === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img 
                    src={preview} 
                    alt={`New ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center hover:opacity-90 opacity-0 group-hover:opacity-100 transition shadow-lg"
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    New
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button / Drop Zone */}
          {totalImages < MAX_IMAGES && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                isDragging 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="text-foreground-secondary">
                <span className="text-3xl block mb-2">📷</span>
                <span className="text-sm block mb-1 font-medium">
                  {totalImages === 0 ? 'Add product images' : 'Add more images'}
                </span>
                <span className="text-xs block">
                  Drag and drop or click to browse (max {MAX_IMAGES})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/listings/${listingId}`}
            className="flex-1 rounded-xl border border-border bg-[var(--background-secondary)] px-5 py-3 text-center text-foreground hover:bg-[var(--card-bg)] transition"
          >
            Cancel
          </Link>
          <button 
            disabled={loading} 
            className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-white shadow-subtle hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
