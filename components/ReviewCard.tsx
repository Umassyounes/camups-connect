'use client'

import Link from 'next/link'
import { isProfilePro } from '@/lib/utils/pro'
import ProBadge from './ProBadge'

interface ReviewCardProps {
  review: {
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
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewerName = review.reviewer?.name || 'Anonymous User'
  const revieweeName = review.reviewee?.name || 'Anonymous User'
  const reviewerInitial = reviewerName.charAt(0).toUpperCase()
  const reviewerIsPro = isProfilePro(review.reviewer as any)
  const revieweeIsPro = isProfilePro(review.reviewee as any)
  
  // Get listing image
  const listingImage = review.transaction?.listing?.images?.[0] || 
                      review.transaction?.listing?.imageUrl || 
                      '/no-image.png'
  
  const listingTitle = review.transaction?.listing?.title || 'Transaction'
  
  // Format date
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  // Generate star display
  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= review.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {review.score}.0
        </span>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      {/* Header: Reviewer Info + Stars */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.reviewer?.avatarUrl ? (
            <img 
              src={review.reviewer.avatarUrl} 
              alt={reviewerName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {reviewerInitial}
            </div>
          )}
          
          {/* Reviewer Name & Date */}
          <div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${review.reviewer?.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {reviewerName}
              </Link>
              {reviewerIsPro && <ProBadge size="sm" />}
            </div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        
        {/* Stars */}
        <div>
          {renderStars()}
        </div>
      </div>
      
      {/* Review Text */}
      {review.review && (
        <p className="text-gray-700 mb-4 leading-relaxed">
          "{review.review}"
        </p>
      )}
      
      {/* Footer: Reviewed User + Listing */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Reviewee Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Review for:</span>
          <Link 
            href={`/profile/${review.reviewee?.id}`}
            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1.5"
          >
            {revieweeName}
            {revieweeIsPro && <ProBadge size="sm" />}
          </Link>
        </div>
        
        {/* Listing Link */}
        {review.transaction?.listing && (
          <Link 
            href={`/listings/${review.transaction.listing.id}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={listingImage} 
              alt={listingTitle}
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
            <span className="max-w-[150px] truncate">
              {listingTitle}
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
