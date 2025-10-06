import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gray-50 text-gray-900"
      >
        {children}
      </body>
    </html>
  )
}
