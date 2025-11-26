import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Guidelines | Campus Connect',
  description: 'Stay safe while buying, selling, and connecting on Campus Connect.',
}

export default function SafetyGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              Safety Guidelines
            </h1>
            <p className="text-gray-700 text-lg">
              Your safety is our top priority. Follow these guidelines for secure transactions.
            </p>
          </div>

          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 rounded-xl p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Vigilant</h3>
                <p className="text-gray-700 leading-relaxed">
                  If something feels off about a transaction or user, trust your instincts. Report 
                  suspicious activity immediately to our moderation team.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10 text-gray-900">
            {/* Meeting in Person */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🤝</span>
                Meeting in Person
              </h2>
              <div className="grid gap-4">
                <div className="bg-green-50 border border-green-300 rounded-xl p-5">
                  <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <span>✓</span> DO
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Meet in public, well-lit areas on campus (libraries, student centers, cafeterias)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Meet during daylight hours when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Bring a friend or let someone know where you're going</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Inspect items thoroughly before completing the transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Use the platform's messaging system to coordinate meetings</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-300 rounded-xl p-5">
                  <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <span>✗</span> DON'T
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Meet in isolated or private locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Invite strangers to your dorm room or apartment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Meet late at night in empty areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Feel pressured to complete a transaction if you're uncomfortable</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payment Safety */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">💳</span>
                Payment Safety
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-sky-700 mb-3">✓ Safe Payment Methods</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600">•</span>
                      <span>Use Campus Connect's built-in payment system (Stripe)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600">•</span>
                      <span>Cash for in-person transactions (count and verify before completing)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600">•</span>
                      <span>University-approved payment apps (Venmo, PayPal with buyer protection)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-300 rounded-xl p-5">
                  <h3 className="font-semibold text-red-700 mb-3">⚠️ Avoid These Practices</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Wire transfers or money orders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Cryptocurrency for items you haven't received</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Sending payment before inspecting the item</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>Sharing bank account or credit card details directly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Scam Prevention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚨</span>
                Recognizing Scams
              </h2>
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-700 mb-4">Red Flags to Watch For:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">Too Good to Be True</strong>
                        <p className="text-sm text-gray-600 mt-1">Prices significantly below market value</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">Urgent Pressure</strong>
                        <p className="text-sm text-gray-600 mt-1">"Act now or the deal is gone" tactics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">Unusual Requests</strong>
                        <p className="text-sm text-gray-600 mt-1">Asking for payment outside the platform</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">No Profile Info</strong>
                        <p className="text-sm text-gray-600 mt-1">Empty profiles or no verification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">Poor Communication</strong>
                        <p className="text-sm text-gray-600 mt-1">Vague responses or avoiding questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚩</span>
                      <div>
                        <strong className="text-gray-900">Shipping Scams</strong>
                        <p className="text-sm text-gray-600 mt-1">Requesting shipping for local items</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🔐</span>
                Account Security
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔑</span>
                    Password Best Practices
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Use a strong, unique password</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Never share your password</li>
                    <li>• Change passwords regularly</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-2xl">📱</span>
                    Device Security
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Log out on shared devices</li>
                    <li>• Avoid public WiFi for transactions</li>
                    <li>• Keep your app updated</li>
                    <li>• Use a secure internet connection</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">🙈</span>
                Protecting Your Personal Information
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Be cautious about sharing personal information. Here's what to keep private:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <h4 className="font-semibold text-red-600 mb-2">Never Share</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Social Security Number</li>
                      <li>• Bank account details</li>
                      <li>• Home address</li>
                      <li>• Full birthdate</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-700 mb-2">Share Carefully</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Phone number</li>
                      <li>• Email address</li>
                      <li>• Campus location</li>
                      <li>• Class schedule</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">Safe to Share</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• University email</li>
                      <li>• Username</li>
                      <li>• General major/year</li>
                      <li>• Campus meeting spots</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Reporting */}
            <section className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl p-6 border border-sky-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🚔</span>
                Reporting Issues
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                If you encounter suspicious behavior, scams, or safety concerns, report it immediately:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">On the Platform</h4>
                  <p className="text-sm text-gray-600">
                    Use the "Report" button on any listing, message, or user profile. Our moderation 
                    team reviews reports within 24 hours.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Email Our Team</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    For urgent safety concerns: <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:underline">campusconnectcapstone@gmail.com</a>
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Campus Security</h4>
                  <p className="text-sm text-gray-600">
                    For immediate threats or emergencies, contact your campus security or call 911.
                  </p>
                </div>
              </div>
            </section>

            {/* Community Trust */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                Building Trust in the Community
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold mb-3">For Sellers</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Post clear, honest photos</li>
                    <li>• Describe items accurately</li>
                    <li>• Respond to inquiries promptly</li>
                    <li>• Verify your phone number</li>
                    <li>• Build positive reviews</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold mb-3">For Buyers</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Check seller ratings and reviews</li>
                    <li>• Ask questions before buying</li>
                    <li>• Meet in safe locations</li>
                    <li>• Leave honest feedback</li>
                    <li>• Complete verified profile</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Final Note */}
            <section className="border-t border-gray-200 pt-8">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💜</span>
                  Remember: Your Safety Comes First
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Trust your instincts. If something doesn't feel right, it probably isn't. No deal is 
                  worth compromising your safety. Our community thrives when everyone looks out for each other.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

