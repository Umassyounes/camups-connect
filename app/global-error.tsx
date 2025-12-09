'use client'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f6f8fd'
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg 
                style={{ width: '40px', height: '40px', color: '#ef4444' }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '8px'
            }}>
              Critical Error
            </h1>
            
            <p style={{
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: 1.6
            }}>
              A critical error has occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4c6ef5',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  fontWeight: 600,
                  borderRadius: '12px',
                  textDecoration: 'none'
                }}
              >
                Go to Homepage
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  <strong>Error (Dev Only):</strong>
                </p>
                <pre style={{
                  fontSize: '11px',
                  color: '#dc2626',
                  overflow: 'auto',
                  maxHeight: '100px',
                  padding: '8px',
                  backgroundColor: '#fff',
                  borderRadius: '4px'
                }}>
                  {error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
