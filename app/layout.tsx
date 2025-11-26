import "./globals.css"
import UserButton from "@/components/UserButton"
import Footer from "@/components/Footer"
import ThemeToggle from "@/components/ThemeToggle"
import NotificationBell from "@/components/NotificationBell"
import AdminNavLink from "@/components/AdminNavLink"
import ClientProviders from "@/components/ClientProviders"

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
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
                {/* Logo and Brand */}
                <a href="/" className="flex items-center gap-3 flex-shrink-0 group">
                  <img src="/logo.png" alt="Campus Connect" className="w-10 h-10 rounded-2xl shadow-[0_8px_30px_rgba(76,110,245,0.35)]" />
                  <div className="hidden sm:block">
                    <div className="font-semibold text-sm uppercase tracking-[0.2em] text-slate-400">Campus Connect</div>
                    <div className="font-black text-2xl text-slate-900 group-hover:text-primary transition-colors">Beacons</div>
                  </div>
                </a>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
                  <a href="/events" className="hover:text-primary transition-colors">Events</a>
                  <a href="/" className="hover:text-primary transition-colors">Marketplace</a>
                  <a href="/my" className="hover:text-primary transition-colors">My Listings</a>
                  <a href="/profile" className="hover:text-primary transition-colors">Profile</a>
                  <AdminNavLink />
                </nav>

                {/* Right Side Icons */}
                <div className="flex items-center gap-3">
                  {/* Messages */}
                  <a href="/messages" className="p-2 hover:bg-slate-100 rounded-xl transition relative">
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  </a>
                  
                  {/* Notifications */}
                  <NotificationBell />
                  
                  {/* Profile */}
                  <UserButton />
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
