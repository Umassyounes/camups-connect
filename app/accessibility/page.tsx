import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement | Campus Connect',
  description: 'Our commitment to making Campus Connect accessible to everyone.',
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1224] to-[#1a1f3a]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
              Accessibility Statement
            </h1>
            <p className="text-white/70 text-lg">
              Last Updated: November 23, 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-white/90">
            {/* Our Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">♿</span>
                Our Commitment to Accessibility
              </h2>
              <p className="leading-relaxed mb-4">
                Campus Connect is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone and applying the relevant 
                accessibility standards to ensure we provide equal access to all of our users.
              </p>
            </section>

            {/* Standards */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">✓</span>
                Conformance Standards
              </h2>
              <p className="leading-relaxed mb-4">
                We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. 
                These guidelines help make web content more accessible for people with disabilities and 
                more user-friendly for everyone.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Perceivable information and user interface</li>
                <li>Operable user interface and navigation</li>
                <li>Understandable information and user interface</li>
                <li>Robust content and reliable interpretation</li>
              </ul>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                Accessibility Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
                  <p className="text-sm text-white/70">
                    Full keyboard accessibility for all interactive elements
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold mb-2">Screen Readers</h3>
                  <p className="text-sm text-white/70">
                    Compatible with JAWS, NVDA, and VoiceOver
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold mb-2">Text Alternatives</h3>
                  <p className="text-sm text-white/70">
                    Alt text for images and descriptive labels
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold mb-2">Color Contrast</h3>
                  <p className="text-sm text-white/70">
                    High contrast ratios meeting WCAG standards
                  </p>
                </div>
              </div>
            </section>

            {/* Known Issues */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🔧</span>
                Known Issues & Ongoing Improvements
              </h2>
              <p className="leading-relaxed mb-4">
                While we strive for full accessibility, we acknowledge that some areas may need improvement:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Some third-party embedded content may have accessibility limitations</li>
                <li>We are actively working on improving mobile touch target sizes</li>
                <li>Enhanced focus indicators are being implemented across all pages</li>
              </ul>
            </section>

            {/* Assistive Technology */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Compatible Assistive Technologies
              </h2>
              <p className="leading-relaxed mb-4">
                Campus Connect is designed to be compatible with the following assistive technologies:
              </p>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="text-sky-400">•</span>
                    Screen readers (JAWS, NVDA, VoiceOver, TalkBack)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-400">•</span>
                    Screen magnification software
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-400">•</span>
                    Speech recognition software
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-sky-400">•</span>
                    Alternative input devices
                  </li>
                </ul>
              </div>
            </section>

            {/* Feedback */}
            <section className="bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-xl p-6 border border-sky-500/30">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">💬</span>
                Feedback & Contact
              </h2>
              <p className="leading-relaxed mb-4">
                We welcome your feedback on the accessibility of Campus Connect. If you encounter any 
                accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <a href="mailto:campusconnectcapstone@gmail.com" className="text-sky-400 hover:text-sky-300">
                    campusconnectcapstone@gmail.com
                  </a>
                </p>
                <p className="text-sm text-white/60 mt-2">
                  We aim to respond to accessibility feedback within 3-5 business days.
                </p>
              </div>
            </section>

            {/* Technical Specs */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                Technical Specifications
              </h2>
              <p className="leading-relaxed">
                Accessibility of Campus Connect relies on the following technologies to work with 
                the particular combination of web browser and any assistive technologies or plugins 
                installed on your computer:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>HTML</li>
                <li>WAI-ARIA</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
            </section>

            {/* Assessment */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Assessment & Testing
              </h2>
              <p className="leading-relaxed">
                Campus Connect has been assessed using a combination of automated testing tools and 
                manual testing by people with disabilities. We conduct regular accessibility audits 
                and continue to make improvements based on user feedback and evolving standards.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
