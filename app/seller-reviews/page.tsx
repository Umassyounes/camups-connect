'use client'

import { useEffect, useState } from 'react'
import ReviewCard from '@/components/ReviewCard'

interface Review {
  id: number
  score: number
  review: string | null
  createdAt: string
  reviewer?: {
    id: number
    name: string | null
    avatarUrl: string | null
    proStatus?: string
  } | null
  reviewee?: {
    id: number
    name: string | null
    avatarUrl: string | null
    proStatus?: string
  } | null
  transaction?: {
    id: number
    listing?: {
      id: number
      title: string | null
      imageUrl: string | null
      images?: string[] | null
    } | null
  } | null
}

interface Stats {
  total: number
  averageRating: number
  breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minScore, setMinScore] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const limit = 12

  useEffect(() => {
    fetchReviews()
  }, [minScore, page])

  async function fetchReviews() {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })
      
      if (minScore !== null) {
        params.append('minScore', minScore.toString())
      }
      
      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }
      
      setReviews(data.reviews)
      setTotalReviews(data.total)
      
      // Calculate stats
      if (data.reviews.length > 0) {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        let sum = 0
        data.reviews.forEach((review: Review) => {
          breakdown[review.score as keyof typeof breakdown]++
          sum += review.score
        })
        
        setStats({
          total: data.total,
          averageRating: sum / data.reviews.length,
          breakdown,
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalReviews / limit)

  return (
    <main className="min-h-screen pb-20 bg-[#F5F7FA]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Community Reviews & Feedback
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Trusted by Students
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community members are saying about their experiences on Campus Connect
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* Total Reviews */}
              <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total.toLocaleString()}
                </div>
                <div className="text-gray-600 font-medium">Total Reviews</div>
              </div>

              {/* Average Rating */}
              <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-yellow-500">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <svg className="w-10 h-10 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>

              {/* Rating Breakdown */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</div>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.breakdown[star as keyof typeof stats.breakdown] || 0
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 w-6">{star}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Reviews
          </h2>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by rating:</label>
            <select
              value={minScore || ''}
              onChange={(e) => {
                setMinScore(e.target.value ? parseInt(e.target.value) : null)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to complete a transaction and leave a review!</p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-gray-500">...</span>}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">How Reviews Work</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                After completing a transaction on Campus Connect, both buyers and sellers can rate each other. 
                Reviews help build trust and create a safer marketplace for everyone.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Reviews are only visible after both parties have rated each other
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your average rating is displayed on your profile
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Be honest and constructive in your reviews
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
