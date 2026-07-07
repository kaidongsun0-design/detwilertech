import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/_next'],
      },
    ],
    sitemap: `${clientEnv.siteUrl}/sitemap.xml`,
  }
}
