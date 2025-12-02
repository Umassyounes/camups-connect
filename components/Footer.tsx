'use client'

import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Successfully subscribed! Check your email.' })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe' })
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 relative overflow-hidden border-t border-slate-200">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Section - Larger on desktop */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Campus Connect" 
                className="w-12 h-12 rounded-2xl shadow-[0_10px_40px_rgba(56,189,248,0.3)] ring-2 ring-sky-400/30" 
              />
              <div>
                <div className="font-semibold text-xs tracking-[0.25em] uppercase text-sky-600">Campus Connect</div>
                <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600">
                  Beacons
                </div>
              </div>
            </div>
            <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-md">
              Empowering campus communities to connect, trade, and thrive together. Your trusted 
              marketplace for student life.
            </p>
            
            {/* Newsletter Signup */}
            <div className="bg-slate-100 backdrop-blur-lg border border-slate-300 rounded-2xl p-4">
              <h4 className="font-semibold text-sm mb-3 text-slate-800">Stay Updated 📬</h4>
              <form onSubmit={handleNewsletterSignup} className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '...' : 'Join'}
                  </button>
                </div>
                {message && (
                  <p className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Note: Please use a Gmail account. Other providers may block our emails.
                </p>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/how-it-works" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  How It Works
                </a>
              </li>
              <li>
                <a href="/events" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Events
                </a>
              </li>
              <li>
                <a href="/listings" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Marketplace
                </a>
              </li>
              <li>
                <a href="/reviews" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/help" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/safety" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Connect</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="mailto:campusconnectcapstone@gmail.com" className="text-slate-600 hover:text-sky-500 transition flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center transition">
                    <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-xs">Email</div>
                    <div className="text-xs">campusconnectcapstone@gmail.com</div>
                  </div>
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Follow Us</p>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com/umb_campusconnect" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 hover:border-pink-500/60 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Local Sponsors Section */}
        <div className="border-t border-slate-200 pt-8 mb-8">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-slate-800 text-lg">Local Sponsors</h3>
              <span className="text-2xl">✨</span>
            </div>
            <p className="text-slate-600 text-sm">
              Coming Soon! We're partnering with local businesses to bring you exclusive deals and perks.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-300">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 font-medium">Stay tuned for exciting partnerships</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <div className="text-slate-500">
            © {new Date().getFullYear()} Campus Connect. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-slate-500">
            <a href="/accessibility" className="hover:text-sky-500 transition">Accessibility</a>
            <a href="/help" className="hover:text-sky-500 transition">Support</a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 opacity-50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Secure Platform</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Verified Community</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span>24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
