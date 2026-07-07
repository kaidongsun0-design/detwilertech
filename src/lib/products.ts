/**
 * 统一产品数据访问层
 *
 * 优先级:
 *   1. data/products.json (由 scripts/scan-products.mjs 生成)
 *   2. 内置 placeholder (Phase 1 兼容)
 *
 * 调用方统一从 getAllProducts / getProductBySlug / getCategories 拿数据
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  placeholderProducts,
  type PlaceholderProduct,
  type PlaceholderSpec,
  type LocalizedString,
} from './placeholder-products'

export type { LocalizedString, PlaceholderSpec }

export interface Product {
  id: string
  slug: string
  sku: string
  name: LocalizedString
  shortDescription?: LocalizedString
  brief?: LocalizedString
  description: LocalizedString
  category: string
  images: string[]
  specifications: Array<{ key: LocalizedString; value: string }>
  moq?: LocalizedString
  leadTime?: LocalizedString
  origin?: LocalizedString
  featured: boolean
  order?: number
  source?: 'placeholder' | 'cobtel' | 'extra' | 'payload'
  sourceUrl?: string
  scrapedAt?: string
}

export interface Category {
  slug: string
  name: LocalizedString
  description?: LocalizedString
  order: number
  count: number
  sampleImage?: string
}

let _cache: { products: Product[]; categories: Category[] } | null = null

function tryReadJson<T>(p: string): T | null {
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as T
  } catch {
    return null
  }
}

function load() {
  if (_cache) return _cache
  const dataDir = join(process.cwd(), 'data')
  const productsJson = tryReadJson<Product[]>(join(dataDir, 'products.json'))
  const categoriesJson = tryReadJson<Category[]>(join(dataDir, 'categories.json'))

  // 优先用 JSON,否则从 placeholder 转换
  const rawProducts: Product[] = productsJson && productsJson.length > 0
    ? productsJson
    : placeholderProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        category: p.category.slug,  // 统一为 slug 字符串
        images: p.images,
        specifications: p.specifications,
        moq: p.moq,
        leadTime: p.leadTime,
        origin: p.origin,
        featured: p.featured,
        order: Number(p.id) || 0,
        source: 'placeholder' as const,
      }))

  // 字段容错: 补齐缺失的 moq/leadTime/origin/featured
  const DEFAULT_MOQ: LocalizedString = { en: 'Negotiable', zh: '可议' }
  const DEFAULT_LEAD: LocalizedString = { en: '15-25 working days', zh: '15-25 个工作日' }
  const DEFAULT_ORIGIN: LocalizedString = { en: 'Shenzhen, China', zh: '中国深圳' }
  const products: Product[] = rawProducts.map((p) => ({
    ...p,
    moq: p.moq ?? DEFAULT_MOQ,
    leadTime: p.leadTime ?? DEFAULT_LEAD,
    origin: p.origin ?? DEFAULT_ORIGIN,
    featured: p.featured ?? false,
    images: p.images && p.images.length > 0 ? p.images : ['/products/xlpe-power.jpg'],
    description: p.description ?? { en: '', zh: '' },
    specifications: p.specifications ?? [],
  }))

  // 类别：JSON 有就用 JSON,否则用从产品里动态聚合
  let categories: Category[] = categoriesJson && categoriesJson.length > 0
    ? categoriesJson
    : []

  if (categories.length === 0) {
    const map = new Map<string, Category>()
    for (const p of products) {
      if (!map.has(p.category)) {
        const ph = placeholderProducts.find((q) => q.category.slug === p.category)
        map.set(p.category, {
          slug: p.category,
          name: ph?.category.name ?? { en: p.category, zh: p.category },
          order: map.size + 1,
          count: 0,
          sampleImage: p.images?.[0],
        })
      }
      map.get(p.category)!.count++
    }
    categories = Array.from(map.values()).sort((a, b) => a.order - b.order)
  }

  _cache = { products, categories }
  return _cache
}

/** 拿全部产品(已按 order 排序) */
export function getAllProducts(): Product[] {
  return load().products.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/** 按 slug 拿单个产品 */
export function getProductBySlug(slug: string): Product | undefined {
  return load().products.find((p) => p.slug === slug)
}

/** 按 id 拿产品(供 /api 等) */
export function getProductById(id: string): Product | undefined {
  return load().products.find((p) => p.id === id)
}

/** 拿精选产品(featured=true) */
export function getFeaturedProducts(limit?: number): Product[] {
  const list = load().products.filter((p) => p.featured)
  return limit ? list.slice(0, limit) : list
}

/** 按分类拿产品 */
export function getProductsByCategory(categorySlug: string): Product[] {
  return load().products.filter((p) => p.category === categorySlug)
}

/** 关键字搜索(name / sku / shortDescription / brief) */
export function searchProducts(q: string): Product[] {
  if (!q) return []
  const k = q.toLowerCase().trim()
  return load().products.filter((p) => {
    return (
      p.name.en.toLowerCase().includes(k) ||
      p.name.zh.toLowerCase().includes(k) ||
      p.sku.toLowerCase().includes(k) ||
      (p.shortDescription?.en.toLowerCase().includes(k) ?? false) ||
      (p.shortDescription?.zh.toLowerCase().includes(k) ?? false) ||
      (p.brief?.en.toLowerCase().includes(k) ?? false) ||
      (p.brief?.zh.toLowerCase().includes(k) ?? false)
    )
  })
}

/** 拿全部分类 */
export function getCategories(): Category[] {
  return load().categories
}

/** 拿单个分类 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return load().categories.find((c) => c.slug === slug)
}

/** 拿相关产品(同分类、排除自身、最多 N 个) */
export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const p = getProductBySlug(slug)
  if (!p) return []
  return load()
    .products.filter((q) => q.category === p.category && q.slug !== slug)
    .slice(0, limit)
}

/** 清除缓存(开发期脚本修改后) */
export function clearProductCache() {
  _cache = null
}
