import "./globals.css"
import UserButton from "@/components/UserButton"
import Footer from "@/components/Footer"
import NotificationBell from "@/components/NotificationBell"
import AdminNavLink from "@/components/AdminNavLink"
import ClientProviders from "@/components/ClientProviders"
import BottomNav from "@/components/BottomNav"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Typography: Inter font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground transition-colors">
        <ClientProviders>
          <div className="min-h-screen flex flex-col">
            {/* Header (always visible) */}
            <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_15px_45px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 md:gap-6 px-3 md:px-6 py-3 md:py-4">
                {/* Logo and Brand */}
                <a href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0 group">
                  <img src="/logo.png" alt="Campus Connect" className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-[0_8px_30px_rgba(76,110,245,0.35)]" />
                  <div className="hidden sm:block">
                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600">
                  Campus Connect
                </div>
                <div className="font-semibold text-xs tracking-[0.25em] uppercase text-sky-600">By Beacons, For Beacons</div>
                  </div>
                </a>

                {/* Navigation Links - Desktop Only */}
                <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
                  <a href="/" className="hover:text-primary transition-colors">Marketplace</a>
                  <a href="/events" className="hover:text-primary transition-colors">Events</a>
                  <a href="/messages" className="hover:text-primary transition-colors">Messages</a>
                  <div className="relative group">
                    <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 hover:bg-slate-100 transition-colors text-slate-700">
                      <span>Post</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-xl z-50">
                      <a href="/listings/new" className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50">Items</a>
                      <a href="/events/new" className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50">Events</a>
                    </div>
                  </div>
                  <a href="/reviews" className="hover:text-primary transition-colors">Reviews</a>
                  <AdminNavLink />
                </nav>

                {/* Right Side Icons */}
                <div className="flex items-center gap-1.5 md:gap-3">
                  {/* Notifications */}
                  <NotificationBell />
                  
                  {/* Profile */}
                  <UserButton />
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 pb-16 sm:pb-0">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Bottom navigation - mobile only */}
            <BottomNav />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
