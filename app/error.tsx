'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-foreground-secondary mb-6">
            We&apos;re sorry, but something unexpected happened. Our team has been notified and is working on a fix.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-100 text-foreground font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Go to Homepage
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left bg-gray-50 rounded-xl p-4 border border-gray-200">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              🐛 Error Details (Development Only)
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500">
                <strong>Message:</strong>
              </p>
              <pre className="text-xs text-red-600 overflow-auto max-h-20 p-2 bg-gray-100 rounded">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-gray-500">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              <p className="text-xs text-gray-500">
                <strong>Stack:</strong>
              </p>
              <pre className="text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                {error.stack}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
