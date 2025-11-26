import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works | Campus Connect',
  description: 'Learn how to use Campus Connect to buy, sell, and connect with your campus community.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              How Campus Connect Works
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Quickly post listings, RSVP for events, and stay connected with other students through messages and real-time notifications.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-gray-900">
            {/* Step-by-Step Guide */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Getting Started
              </h2>
              
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-sky-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Profile</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Complete your profile so buyers and event organizers know who they're working with. Add a profile picture, bio, and verify your university email to build trust in the community.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Add Listings or Events</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Share what you're selling or invite classmates to upcoming meetups in just a few clicks. Upload photos, set prices, and add detailed descriptions to attract buyers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Coordinate in Messages</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Use the in-app inbox to iron out details and keep everything organized. Chat with buyers, sellers, and event attendees securely within the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-yellow-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Notified</h3>
                      <p className="text-gray-700 leading-relaxed">
                        You'll receive instant alerts when someone reaches out, RSVPs, or updates an event you're attending. Never miss an important update!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                Key Features
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg border border-blue-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">🛍️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Buy & Sell</h3>
                  <p className="text-gray-600 text-sm">
                    List items for sale, browse local deals, and complete secure transactions with fellow students.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-lg border border-green-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">📅</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Events</h3>
                  <p className="text-gray-600 text-sm">
                    Create and discover campus events, RSVP to activities, and build your social calendar.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg border border-purple-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Messaging</h3>
                  <p className="text-gray-600 text-sm">
                    Chat directly with other users, negotiate prices, and coordinate meetups safely.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">🔔</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Notifications</h3>
                  <p className="text-gray-600 text-sm">
                    Real-time alerts keep you updated on messages, offers, and event changes.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-lg border border-red-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Safety First</h3>
                  <p className="text-gray-600 text-sm">
                    Verified university emails, user ratings, and reporting tools keep the community safe.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 backdrop-blur-lg border border-pink-500/30 rounded-xl p-5">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pro Features</h3>
                  <p className="text-gray-600 text-sm">
                    Boost listings, get priority support, and enjoy an ad-free experience with Pro.
                  </p>
                </div>
              </div>
            </section>

            {/* Need Help Section */}
            <section className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl p-6 border border-sky-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">💡</span>
                Need Help Getting Started?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Check the onboarding guide in the resources section or reach out to the campus team anytime. We're here to help you make the most of Campus Connect!
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/help" 
                  className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Visit Help Center
                </a>
                <a 
                  href="mailto:campusconnectcapstone@gmail.com" 
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-lg border border-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  Contact Support
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

