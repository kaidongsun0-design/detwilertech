#!/usr/bin/env node
/**
 * 把 scripts/scrape-cobtel.mjs 生成的 data/products.json
 * 转成 src/lib/placeholder-products.ts 的形式并写入。
 *
 * 用法：
 *   node scripts/import-products.mjs
 *
 * 输出：
 *   src/lib/placeholder-products.ts   — 前端可直接 import
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const INPUT_JSON = join(PROJECT_ROOT, 'data', 'products.json')
const OUTPUT_TS = join(PROJECT_ROOT, 'src', 'lib', 'placeholder-products.ts')

/** 简单中英翻译兜底（如果抓的是英文，中文就用同样的文本，方便后期人工校对） */
function bi(value) {
  if (!value) return { en: '', zh: '' }
  return { en: value, zh: value }
}

/** 从分类字符串推断 slug */
function categorySlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/gi, '-')
    .replace(/^-|-$/g, '')
}

/** 给产品分配 featured 标记（前 4 个标 true） */
function pickFeatured(products) {
  return products.map((p, i) => ({ ...p, featured: i < 4 }))
}

/** 智能取分类：把相同名字的合并 */
function buildCategories(products) {
  const seen = new Map()
  for (const p of products) {
    const raw = p.category || 'General'
    const slug = categorySlug(raw)
    if (!seen.has(slug)) {
      seen.set(slug, {
        slug,
        name: { en: raw, zh: raw },
        description: { en: '', zh: '' },
      })
    }
  }
  return Array.from(seen.values())
}

/** 把单个 scraped 产品映射成 PlaceholderProduct 形状 */
function mapProduct(p, index, allCategories) {
  const catSlug = categorySlug(p.category || 'General')
  const cat =
    allCategories.find((c) => c.slug === catSlug) || allCategories[0]

  return {
    id: p.id || `cobtel-${index + 1}`,
    slug: p.slug || `product-${index + 1}`,
    sku: p.sku || `COBTEL-${index + 1}`,
    name: bi(p.name),
    shortDescription: bi(
      p.description?.replace(/<[^>]+>/g, '').slice(0, 140) || '',
    ),
    description: bi(p.description || ''),
    category: cat,
    images: p.images || [],
    moq: { en: 'Negotiable', zh: '可议' },
    leadTime: { en: '15-30 days', zh: '15-30 天' },
    origin: { en: 'China', zh: '中国' },
    specifications: (p.specifications || []).map((s) => ({
      key: bi(s.key),
      value: s.value,
    })),
    featured: p.featured ?? index < 4,
  }
}

async function main() {
  console.log('📥 读取抓取结果...')
  let raw
  try {
    raw = await readFile(INPUT_JSON, 'utf-8')
  } catch (e) {
    console.error(`❌ 找不到 ${INPUT_JSON}`)
    console.error('请先运行：node scripts/scrape-cobtel.mjs')
    process.exit(1)
  }

  const scraped = JSON.parse(raw)
  if (!Array.isArray(scraped) || scraped.length === 0) {
    console.error('❌ products.json 为空或格式不对')
    process.exit(1)
  }

  console.log(`  ✓ 加载了 ${scraped.length} 条原始产品`)

  const products = pickFeatured(scraped).map((p, i, arr) =>
    mapProduct(p, i, buildCategories(arr)),
  )

  const categories = buildCategories(scraped)

  console.log(`\n📝 生成 TypeScript 文件...`)
  console.log(`  产品数：${products.length}`)
  console.log(`  分类数：${categories.length}`)

  // 生成 .ts 文件内容
  const tsContent = `/**
 * 产品数据 - 由 scripts/import-products.mjs 从 data/products.json 生成
 * 上次更新：${new Date().toISOString()}
 *
 * 说明：
 * - 占位数据结构，等 Phase 3 Payload CMS 接通后，前端会改成从 getPayload() 取数
 * - 字段为 localized 形式：{ en, zh }
 */

export interface LocalizedString {
  en: string
  zh: string
}

export interface ProductSpec {
  key: LocalizedString
  value: string
}

export interface ProductCategory {
  slug: string
  name: LocalizedString
  description: LocalizedString
}

export interface PlaceholderProduct {
  id: string
  slug: string
  sku: string
  name: LocalizedString
  shortDescription: LocalizedString
  description: LocalizedString
  category: ProductCategory
  images: string[]
  moq: LocalizedString
  leadTime: LocalizedString
  origin: LocalizedString
  specifications: ProductSpec[]
  featured?: boolean
}

export const placeholderProducts: PlaceholderProduct[] = ${JSON.stringify(
    products,
    null,
    2,
  )}

export const placeholderCategories: ProductCategory[] = ${JSON.stringify(
    categories,
    null,
    2,
  )}

export function getProductBySlug(slug: string): PlaceholderProduct | undefined {
  return placeholderProducts.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): PlaceholderProduct[] {
  return placeholderProducts.filter((p) => p.category.slug === categorySlug)
}

export function getFeaturedProducts(): PlaceholderProduct[] {
  return placeholderProducts.filter((p) => p.featured)
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return placeholderCategories.find((c) => c.slug === slug)
}
`

  await writeFile(OUTPUT_TS, tsContent, 'utf-8')

  console.log(`\n✅ 写入：${OUTPUT_TS}`)
  console.log(`\n下一步：`)
  console.log(`   1. 检查文件内容（src/lib/placeholder-products.ts）`)
  console.log(`   2. 启动 dev：npm run dev`)
  console.log(`   3. 浏览器访问 http://localhost:3000/zh/products`)
  console.log(`\n提示：`)
  console.log(`   - 如果有些产品没有图片（images=[]），placeholder 会用渐变背景兜底`)
  console.log(`   - 中文翻译可在生成的文件里手动改：搜 "zh: '${raw[0]?.name?.en}" 这种字面量`)
  console.log(`   - 重新跑抓取：rm data/products.json && node scripts/scrape-cobtel.mjs && node scripts/import-products.mjs`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
