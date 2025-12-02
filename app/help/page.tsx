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
          a: "Click the 'Sign Up' button in the top right corner. You can register using your Google account or university email address through our authentication system. Make sure to verify your email to unlock all features!"
        },
        {
          q: "Is Campus Connect free to use?",
          a: "Yes! Campus Connect is completely free to use. All features including listings, events, and messaging are available at no cost."
        },
        {
          q: "What universities are supported?",
          a: "We currently support UMass Boston and are expanding to other universities. Check your university email domain to see if it's supported during registration."
        }
      ]
    },
    {
      category: "Buying & Selling",
      questions: [
        {
          q: "How do I list an item for sale?",
          a: "Navigate to 'My Listings' or click 'Post a Listing' in the navigation. Add photos (up to 5), description, price, condition, and category. Your listing will be visible to your campus community immediately!"
        },
        {
          q: "How do payments work?",
          a: "Currently, all transactions are arranged directly between buyers and sellers. Campus Connect provides the platform for connecting, but payment arrangements are made in person. Always meet in a safe, public location on campus."
        },
        {
          q: "What fees does Campus Connect charge?",
          a: "Campus Connect is completely free - there are no fees for posting listings or making transactions. We don't charge any service fees."
        },
        {
          q: "How can I edit or delete my listing?",
          a: "Go to 'My Listings', find your listing, and click on it to view options for editing or deleting. You can update photos, price, description, and mark items as sold."
        }
      ]
    },
    {
      category: "Safety & Security",
      questions: [
        {
          q: "Is it safe to meet buyers/sellers in person?",
          a: "Always meet in public, well-lit areas on campus such as the library, student center, or campus security office. Never share personal financial information or passwords. See our Safety Guidelines for more tips on safe transactions."
        },
        {
          q: "What should I do if I encounter a scam or suspicious activity?",
          a: "Report the user immediately using the 'Report' button on their profile or listing. Our moderation team reviews all reports within 24 hours and takes appropriate action."
        },
        {
          q: "How does Campus Connect verify users?",
          a: "Users sign in through our secure authentication system using Google or email. We also offer optional phone verification for added security and trust within the community."
        },
        {
          q: "How do I report inappropriate content?",
          a: "Use the 'Report' button found on listings, profiles, or events. Describe the issue and our moderation team will review it promptly."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I edit my profile?",
          a: "Go to your Profile page by clicking your profile icon in the top right, then click 'Edit Profile'. You can update your profile photo, bio, campus location, and other information."
        },
        {
          q: "How do I sign out?",
          a: "Click on your profile icon in the top right corner, then select 'Sign Out' from the dropdown menu."
        },
        {
          q: "What is phone verification?",
          a: "Phone verification adds an extra layer of security to your account and helps build trust with other users. It's optional but recommended for active sellers and event organizers."
        },
        {
          q: "Can I change my email address?",
          a: "Your account is tied to your authentication method (Google or email). To change it, you'll need to create a new account with the new email address."
        }
      ]
    },
    {
      category: "Events & Community",
      questions: [
        {
          q: "How do I create an event?",
          a: "Navigate to the Events section and click 'Create Event'. Add details like title, description, date, time, location, and an optional event image. Events are visible to all campus community members."
        },
        {
          q: "Can I edit or cancel an event I created?",
          a: "Yes! Go to the event page and you'll see options to edit or delete your event if you're the creator. Any updates will be visible immediately."
        },
        {
          q: "How do I find events on campus?",
          a: "Visit the Events page to browse all upcoming campus events. You can filter by category and search for specific events."
        },
        {
          q: "Can anyone create an event?",
          a: "Yes! All verified users can create events. This includes club meetings, study groups, campus activities, and social gatherings."
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
              <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:text-sky-700 text-base font-medium break-all">
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
