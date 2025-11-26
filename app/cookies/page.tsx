import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Campus Connect',
  description: 'Learn about how Campus Connect uses cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              Cookie Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last Updated: November 23, 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-gray-900">
            {/* What Are Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🍪</span>
                What Are Cookies?
              </h2>
              <p className="leading-relaxed mb-4">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                understanding how you use our service.
              </p>
              <p className="leading-relaxed">
                Campus Connect uses cookies and similar tracking technologies to improve your experience, 
                analyze site traffic, and understand where our visitors are coming from.
              </p>
            </section>

            {/* Types of Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Essential Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are necessary for the website to function properly. They enable core 
                    functionality such as security, authentication, and accessibility features.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-semibold mb-2">Examples:</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Authentication tokens</li>
                      <li>• Session management</li>
                      <li>• Security cookies</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Duration:</strong> Session or up to 30 days
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">📊</span>
                    Analytics & Performance Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously. This helps us improve our service.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-semibold mb-2">Examples:</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Page views and visitor counts</li>
                      <li>• Time spent on pages</li>
                      <li>• Navigation patterns</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-purple-600">⚙️</span>
                    Functional Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies enable enhanced functionality and personalization, such as remembering 
                    your preferences and settings.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-semibold mb-2">Examples:</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Language preferences</li>
                      <li>• Theme settings (dark/light mode)</li>
                      <li>• Region selection</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Duration:</strong> Up to 1 year
                  </p>
                </div>

                {/* Advertising Cookies */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-yellow-700">📢</span>
                    Advertising & Targeting Cookies
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These cookies are used to deliver relevant advertisements and track ad campaign 
                    performance. They may be set by our advertising partners.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-semibold mb-2">Examples:</p>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Ad relevance tracking</li>
                      <li>• Conversion tracking</li>
                      <li>• Interest-based advertising</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Duration:</strong> Up to 1 year
                  </p>
                </div>
              </div>
            </section>

            {/* Third Party Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔗</span>
                Third-Party Cookies
              </h2>
              <p className="leading-relaxed mb-4">
                We may also use cookies from trusted third-party services to enhance your experience:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600">Supabase for secure user authentication</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <p className="text-sm text-gray-600">Stripe for secure transactions</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">Communication</h4>
                  <p className="text-sm text-gray-600">Twilio for phone verification</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">Email Services</h4>
                  <p className="text-sm text-gray-600">SendGrid for notifications</p>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl p-6 border border-sky-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🎛️</span>
                Managing Your Cookie Preferences
              </h2>
              <p className="leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise 
                your cookie preferences through:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 mt-1">1.</span>
                  <div>
                    <strong className="text-gray-900">Browser Settings:</strong>
                    <p className="text-gray-700 text-sm mt-1">
                      Most web browsers allow you to control cookies through their settings. You can 
                      set your browser to refuse cookies or delete certain cookies.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 mt-1">2.</span>
                  <div>
                    <strong className="text-gray-900">Our Cookie Settings:</strong>
                    <p className="text-gray-700 text-sm mt-1">
                      You can manage your cookie preferences through our cookie consent banner when 
                      you first visit the site.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 mt-1">3.</span>
                  <div>
                    <strong className="text-gray-900">Opt-Out Tools:</strong>
                    <p className="text-gray-700 text-sm mt-1">
                      Visit <a href="https://www.aboutads.info/choices/" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">aboutads.info</a> or <a href="https://www.youronlinechoices.com/" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">youronlinechoices.com</a> for 
                      industry opt-out tools.
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-yellow-700">⚠️ Note:</strong> Blocking or deleting cookies 
                  may limit your ability to use certain features of our website.
                </p>
              </div>
            </section>

            {/* Do Not Track */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Do Not Track Signals
              </h2>
              <p className="leading-relaxed">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you 
                visit that you do not want to have your online activity tracked. We honor DNT signals 
                and do not track, plant cookies, or use advertising when a DNT browser mechanism is in place.
              </p>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Cookie Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We encourage you to review this 
                page periodically for the latest information on our cookie practices.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions About Cookies?
              </h2>
              <p className="leading-relaxed mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:text-sky-300">
                    campusconnectcapstone@gmail.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

