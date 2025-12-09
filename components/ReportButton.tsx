'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ReportButtonProps {
  contentType: 'listing' | 'message' | 'profile' | 'event'
  contentId: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const REPORT_CATEGORIES = [
  { value: 'scam', label: '🚨 Scam or Fraud' },
  { value: 'spam', label: '📧 Spam' },
  { value: 'inappropriate', label: '⚠️ Inappropriate Content' },
  { value: 'harassment', label: '😠 Harassment or Hate Speech' },
  { value: 'fake', label: '🎭 Fake or Misleading' },
  { value: 'prohibited', label: '🚫 Prohibited Item' },
  { value: 'other', label: '❓ Other' },
]

export default function ReportButton({
  contentType,
  contentId,
  size = 'md',
  className = '',
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted before using portal
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category) {
      setError('Please select a category')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          category,
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      setSubmitted(true)
      setTimeout(() => {
        setShowModal(false)
        setSubmitted(false)
        setCategory('')
        setDescription('')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal itself
        if (e.target === e.currentTarget) {
          setShowModal(false)
        }
      }}
    >
      <div 
        className="rounded-xl p-8 shadow-2xl"
        style={{ 
          width: '480px', 
          maxWidth: '95vw',
          backgroundColor: 'var(--card, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
          color: 'var(--foreground, #111827)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-12">
            <div className="text-7xl mb-6">✅</div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground, #111827)' }}>
              Report Submitted
            </h3>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary, #6b7280)' }}>
              Thank you for helping keep our community safe!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--foreground, #111827)' }}>
                🚩 Report Content
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl leading-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'var(--foreground-secondary, #6b7280)' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  className="block text-base font-medium mb-3"
                  style={{ color: 'var(--foreground, #111827)' }}
                >
                  Why are you reporting this?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--background, #ffffff)',
                    color: 'var(--foreground, #111827)',
                    border: '1px solid var(--border, #e5e7eb)'
                  }}
                  required
                >
                  <option value="">Select a reason...</option>
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  className="block text-base font-medium mb-3"
                  style={{ color: 'var(--foreground, #111827)' }}
                >
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-base rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--background, #ffffff)',
                    color: 'var(--foreground, #111827)',
                    border: '1px solid var(--border, #e5e7eb)'
                  }}
                  rows={4}
                  maxLength={1000}
                  placeholder="Provide any additional context..."
                />
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-base">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-base font-medium rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{
                    border: '1px solid var(--border, #e5e7eb)',
                    color: 'var(--foreground, #111827)'
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-base font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${sizeClasses[size]} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors ${className}`}
        title="Report this content"
      >
        🚩 Report
      </button>

      {showModal && mounted && createPortal(modalContent, document.body)}
    </>
  )
}
