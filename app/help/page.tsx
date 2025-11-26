'use client'

import { useState } from 'react'
import { Metadata } from 'next'

export default function HelpCenterPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign Up' button in the top right corner. You can register using your university email address. Make sure to verify your email to unlock all features!"
        },
        {
          q: "Is Campus Connect free to use?",
          a: "Yes! Basic features are completely free. We also offer a Pro subscription with additional features like listing boosts, priority support, and ad-free browsing."
        },
        {
          q: "What universities are supported?",
          a: "We currently support multiple universities and are constantly expanding. Check your university email domain to see if it's supported during registration."
        }
      ]
    },
    {
      category: "Buying & Selling",
      questions: [
        {
          q: "How do I list an item for sale?",
          a: "Navigate to 'My Listings' and click 'Create New Listing'. Add photos, description, price, and category. Your listing will be visible to your campus community immediately!"
        },
        {
          q: "How do payments work?",
          a: "We use Stripe for secure payments. Buyers can pay through the platform, and funds are held securely until the transaction is confirmed. Sellers receive payouts directly to their connected bank account."
        },
        {
          q: "What fees does Campus Connect charge?",
          a: "We charge a small service fee on completed transactions to maintain the platform. The exact fee is displayed before you complete your purchase or listing."
        },
        {
          q: "How do I boost my listing?",
          a: "Pro subscribers can boost their listings to appear at the top of search results. Go to your listing and click 'Boost' to increase visibility."
        }
      ]
    },
    {
      category: "Safety & Security",
      questions: [
        {
          q: "Is it safe to meet buyers/sellers in person?",
          a: "Always meet in public, well-lit areas on campus. Never share personal financial information. See our Safety Guidelines for more tips on safe transactions."
        },
        {
          q: "What should I do if I encounter a scam?",
          a: "Report the user immediately using the 'Report' button on their profile or listing. Our moderation team reviews all reports within 24 hours."
        },
        {
          q: "How does Campus Connect verify users?",
          a: "All users must verify their university email address. We also offer optional phone verification for added security and trust."
        },
        {
          q: "Can I block a user?",
          a: "Yes! Visit the user's profile and click 'Block User'. You won't see their listings or receive messages from them anymore."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I edit my profile?",
          a: "Go to your Profile page and click 'Edit Profile'. You can update your photo, bio, contact preferences, and more."
        },
        {
          q: "I forgot my password. What do I do?",
          a: "Click 'Forgot Password' on the login page. We'll send a password reset link to your registered email address."
        },
        {
          q: "How do I delete my account?",
          a: "Go to Profile Settings > Account > Delete Account. Note that this action is permanent and cannot be undone."
        },
        {
          q: "What is phone verification?",
          a: "Phone verification adds an extra layer of security to your account. It also increases trust with other users and unlocks certain features."
        }
      ]
    },
    {
      category: "Events & Community",
      questions: [
        {
          q: "How do I create an event?",
          a: "Navigate to the Events section and click 'Create Event'. Add details like time, location, description, and any ticket information."
        },
        {
          q: "Can I sponsor an event?",
          a: "Yes! Pro users and local businesses can sponsor events for increased visibility. Contact our team for sponsorship opportunities."
        },
        {
          q: "How do I RSVP to an event?",
          a: "Click on any event and hit the 'RSVP' or 'Get Tickets' button. You'll receive confirmation and reminders via email."
        }
      ]
    },
    {
      category: "Pro Subscription",
      questions: [
        {
          q: "What benefits do I get with Pro?",
          a: "Pro subscribers get listing boosts, priority support, ad-free experience, advanced analytics, and special badges on their profile."
        },
        {
          q: "How much does Pro cost?",
          a: "Pro subscription is $9.99/month or $89.99/year (save 25%). You can cancel anytime."
        },
        {
          q: "Can I cancel my Pro subscription?",
          a: "Yes! You can cancel anytime from your Profile Settings. You'll retain Pro benefits until the end of your billing period."
        }
      ]
    }
  ]

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(faq =>
      searchQuery === '' ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
            Help Center
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            Find answers to common questions and get support
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition shadow-sm"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <a href="/safety" className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Safety Guidelines</h3>
            <p className="text-gray-600 text-sm">Learn how to stay safe while using Campus Connect</p>
          </a>
          <a href="/privacy" className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
            <p className="text-gray-600 text-sm">Understand how we protect your data</p>
          </a>
          <a href="/contact" className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-600 text-sm">Reach out to our support team</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">❓</span>
            Frequently Asked Questions
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term or browse all questions below</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-2xl font-bold text-sky-600 mb-4">{category.category}</h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex
                      const isOpen = openFAQ === globalIndex
                      return (
                        <div
                          key={faqIndex}
                          className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300 hover:shadow-sm"
                        >
                          <button
                            onClick={() => setOpenFAQ(isOpen ? null : globalIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition"
                          >
                            <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                            <svg
                              className={`w-5 h-5 text-sky-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4 text-gray-700 leading-relaxed border-t border-gray-200 pt-4">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-sky-100 to-blue-100 rounded-2xl p-8 border border-sky-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="text-3xl">💬</span>
            Still Need Help?
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span className="font-semibold text-lg text-gray-900">Email Support</span>
              </div>
              <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:text-sky-700 text-base font-medium">
                campusconnectcapstone@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-2">Response within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
