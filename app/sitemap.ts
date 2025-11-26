import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://campusconnect.edu' // Update with your actual domain
  const currentDate = new Date()

  // Static pages
  const routes = [
    '',
    '/how-it-works',
    '/help',
    '/safety',
    '/privacy',
    '/cookies',
    '/accessibility',
    '/monetize',
    '/login',
    '/onboarding',
    '/profile',
    '/messages',
    '/notifications',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic routes (listings, events)
  const dynamicRoutes = [
    '/listings',
    '/events',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...routes, ...dynamicRoutes]
}
