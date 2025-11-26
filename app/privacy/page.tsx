import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Campus Connect',
  description: 'Learn how Campus Connect collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last Updated: November 23, 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-gray-900 leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔒</span>
                Our Commitment to Your Privacy
              </h2>
              <p className="mb-4">
                At Campus Connect ("we," "us," or "our"), we take your privacy seriously. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our platform and services.
              </p>
              <p>
                By using Campus Connect, you agree to the collection and use of information in accordance 
                with this policy. If you do not agree with our policies and practices, please do not use 
                our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-sky-600 mb-3">
                    Personal Information You Provide
                  </h3>
                  <p className="mb-3 text-gray-700">
                    We collect information that you voluntarily provide when using our services:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Account Information:</strong> Name, email address, university affiliation, password</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Profile Information:</strong> Bio, profile picture, phone number (optional)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Transaction Information:</strong> Listings, purchases, payment details, messages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Communication Data:</strong> Messages with other users, support tickets</span>
                    </li>
                  </ul>
                </div>

                {/* Automatically Collected */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-sky-600 mb-3">
                    Information Collected Automatically
                  </h3>
                  <p className="mb-3 text-gray-700">
                    We automatically collect certain information when you use our platform:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Usage Data:</strong> Pages viewed, features used, time spent on platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Device Information:</strong> IP address, browser type, operating system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Cookies:</strong> Small data files stored on your device (see our Cookie Policy)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Location Data:</strong> General location based on IP address (if enabled)</span>
                    </li>
                  </ul>
                </div>

                {/* Third Party */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-sky-600 mb-3">
                    Information from Third Parties
                  </h3>
                  <p className="mb-3 text-gray-700">
                    We may receive information from third-party services:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Authentication Providers:</strong> Email verification data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Payment Processors:</strong> Transaction confirmation and payment status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 mt-1">•</span>
                      <span><strong>Verification Services:</strong> Phone number verification status</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the information we collect for the following purposes:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Service Delivery
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create and manage your account</li>
                    <li>• Process transactions</li>
                    <li>• Enable communication between users</li>
                    <li>• Provide customer support</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Platform Improvement
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Analyze usage patterns</li>
                    <li>• Improve features and functionality</li>
                    <li>• Develop new services</li>
                    <li>• Fix bugs and issues</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    Safety & Security
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Detect and prevent fraud</li>
                    <li>• Enforce our Terms of Service</li>
                    <li>• Protect against abuse</li>
                    <li>• Verify user identity</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-yellow-700">✓</span>
                    Communication
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Send transactional emails</li>
                    <li>• Provide updates and notifications</li>
                    <li>• Respond to inquiries</li>
                    <li>• Send promotional content (opt-in)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🤝</span>
                How We Share Your Information
              </h2>
              <p className="mb-4">
                We may share your information in the following circumstances:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">With Other Users</h4>
                  <p className="text-sm text-gray-600">
                    Your public profile information, listings, and reviews are visible to other users 
                    to facilitate transactions and build trust within the community.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">With Service Providers</h4>
                  <p className="text-sm text-gray-600">
                    We share information with trusted third-party service providers who help us operate 
                    the platform (payment processing, email delivery, cloud hosting, analytics).
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">For Legal Reasons</h4>
                  <p className="text-sm text-gray-600">
                    We may disclose information if required by law, court order, or to protect the 
                    rights, property, or safety of Campus Connect, our users, or others.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold mb-2">Business Transfers</h4>
                  <p className="text-sm text-gray-600">
                    In the event of a merger, acquisition, or sale of assets, your information may be 
                    transferred as part of the business transaction.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-green-600">✓ Note:</strong> We never sell your personal 
                  information to advertisers or third parties for marketing purposes.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                Data Security
              </h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-3xl mb-2">🔐</div>
                  <h4 className="font-semibold mb-2">Encryption</h4>
                  <p className="text-xs text-gray-600">Data encrypted in transit and at rest</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-3xl mb-2">🔑</div>
                  <h4 className="font-semibold mb-2">Access Control</h4>
                  <p className="text-xs text-gray-600">Limited access to authorized personnel</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <h4 className="font-semibold mb-2">Monitoring</h4>
                  <p className="text-xs text-gray-600">Continuous security monitoring and audits</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-yellow-700">⚠️ Important:</strong> No method of transmission 
                  over the internet is 100% secure. While we strive to protect your information, we 
                  cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl p-6 border border-sky-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚖️</span>
                Your Privacy Rights
              </h2>
              <p className="mb-4">
                You have the following rights regarding your personal information:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold">1.</span>
                  <div>
                    <strong>Access:</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Request a copy of the personal information we hold about you
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold">2.</span>
                  <div>
                    <strong>Correction:</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Update or correct inaccurate information in your profile
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold">3.</span>
                  <div>
                    <strong>Deletion:</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Request deletion of your account and associated data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold">4.</span>
                  <div>
                    <strong>Opt-Out:</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Unsubscribe from marketing emails and adjust notification preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold">5.</span>
                  <div>
                    <strong>Data Portability:</strong>
                    <p className="text-sm text-gray-700 mt-1">
                      Request a copy of your data in a machine-readable format
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                To exercise these rights, contact us at <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:underline">campusconnectcapstone@gmail.com</a>
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention
              </h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services 
                and fulfill the purposes outlined in this policy. When you delete your account:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Your profile and listings are removed from public view immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Some data may be retained for legal, security, or business purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Transaction history may be retained for financial compliance</span>
                </li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Children's Privacy
              </h2>
              <p>
                Campus Connect is intended for use by university students and adults 18 years or older. 
                We do not knowingly collect personal information from children under 18. If you believe 
                we have collected information from a minor, please contact us immediately.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                International Users
              </h2>
              <p>
                Campus Connect is based in the United States. If you access our services from outside 
                the U.S., your information may be transferred to, stored, and processed in the United 
                States or other countries where our service providers operate. By using our services, 
                you consent to this transfer.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for legal, regulatory, or operational reasons. When we make significant changes:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>We will update the "Last Updated" date at the top of this page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>We may notify you via email or platform notification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600">•</span>
                  <span>Your continued use constitutes acceptance of the updated policy</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our 
                data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <div>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-600 hover:underline">
                      campusconnectcapstone@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <strong>Address:</strong> Campus Connect, 123 Campus Drive
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

