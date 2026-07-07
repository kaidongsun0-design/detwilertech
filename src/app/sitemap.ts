import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env'
import { getAllProducts, getCategories } from '@/lib/products'

const LOCALES = ['en', 'zh'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.siteUrl.replace(/\/$/, '')
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // 静态页面
  const staticPaths = ['', '/products', '/about', '/contact']
  for (const locale of LOCALES) {
    for (const p of staticPaths) {
      entries.push({
        url: `${base}/${locale}${p}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: p === '' ? 1.0 : 0.8,
      })
    }
  }

  // 产品分类
  for (const locale of LOCALES) {
    for (const c of getCategories()) {
      entries.push({
        url: `${base}/${locale}/products/category/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  // 产品详情
  for (const locale of LOCALES) {
    for (const p of getAllProducts()) {
      entries.push({
        url: `${base}/${locale}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
