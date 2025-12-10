import "./globals.css"
import Footer from "@/components/Footer"
import ClientProviders from "@/components/ClientProviders"
import BottomNav from "@/components/BottomNav"
import Header from "@/components/Header"

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
            <Header />

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
