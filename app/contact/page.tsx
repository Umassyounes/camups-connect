'use client'

import { useState } from 'react'

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name || !formData.subject || !formData.message) {
      setSubmitMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    setLoading(true)
    setSubmitMessage(null)

    try {
      // Send auto-reply to user
      const autoReplyResponse = await fetch('/api/support-autoreply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          subject: formData.subject,
        }),
      })

      if (autoReplyResponse.ok) {
        setSubmitMessage({ 
          type: 'success', 
          text: 'Message sent! Check your email for confirmation. Our team will respond within 24 hours.' 
        })
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: 'Failed to send message. Please try emailing us directly at campusconnectcapstone@gmail.com' 
        })
      }
    } catch (error) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Something went wrong. Please email us at campusconnectcapstone@gmail.com' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1224] to-[#1a1f3a]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
            Contact Support
          </h1>
          <p className="text-white/70 text-lg">
            Have a question or need help? We're here for you!
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <a 
            href="mailto:campusconnectcapstone@gmail.com"
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-xl font-bold text-white mb-2">Email Us Directly</h3>
            <p className="text-white/70 text-sm mb-2">campusconnectcapstone@gmail.com</p>
            <p className="text-white/50 text-xs">Click to open your email client</p>
          </a>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold text-white mb-2">Response Time</h3>
            <p className="text-white/70 text-sm mb-2">Within 24 hours</p>
            <p className="text-white/50 text-xs">Monday - Friday, business days</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">Send us a message</h2>
          <p className="text-white/60 mb-8">Fill out the form below and we'll get back to you soon</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition disabled:opacity-50"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition disabled:opacity-50"
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-white mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition disabled:opacity-50"
                placeholder="What can we help you with?"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={loading}
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none disabled:opacity-50"
                placeholder="Please provide as much detail as possible..."
                required
              />
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`p-4 rounded-xl ${
                submitMessage.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                <p className="text-sm">{submitMessage.text}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm text-center">
              You'll receive an automated confirmation email immediately, and our team will respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Looking for something specific?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="/help" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center">
              <div className="text-3xl mb-2">❓</div>
              <h4 className="font-semibold text-white mb-1">Help Center</h4>
              <p className="text-xs text-white/60">Browse FAQs</p>
            </a>
            <a href="/safety" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="font-semibold text-white mb-1">Safety</h4>
              <p className="text-xs text-white/60">Stay safe online</p>
            </a>
            <a href="/privacy" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-white mb-1">Privacy</h4>
              <p className="text-xs text-white/60">Data protection</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
