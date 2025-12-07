import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/staff/'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
