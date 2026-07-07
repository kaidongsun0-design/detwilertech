#!/usr/bin/env node
/**
 * COBTEL.com 产品抓取脚本 (v2)
 *
 * 选择器（经过 inspect-cobtel.mjs 实际探查后确定）：
 *   顶级分类:        a.inmenu_1
 *   子分类(产品列表): li.LiLevel2 a       → 形如 /rj45-modular-plug/cat5e-modular-plug/
 *   列表页产品卡:     .products-list-box
 *   产品名+详情链接:  a.products-item-name
 *   列表页缩略图:     .products-list-img img
 *   详情页主图集:     #gallery .swiper-slide img  (无 size 后缀, 原图)
 *   详情页主图:       .preview-container .small-box img
 *   详情页标题:       .prodetails-name
 *   详情页简介:       .pdshow-r-text
 *   详情页完整描述:   .prodetails-box-cont
 *   详情页面包屑:     .prodetails-page a
 *
 * 用法:
 *   node scripts/scrape-cobtel.mjs
 *
 * 输出:
 *   data/products.json          — 产品数据
 *   public/products/*.jpg|webp  — 产品图片
 */

import { chromium } from 'playwright'
import { writeFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const DATA_DIR = join(PROJECT_ROOT, 'data')
const IMG_DIR = join(PROJECT_ROOT, 'public', 'products')
const OUTPUT_JSON = join(DATA_DIR, 'products.json')

const BASE_URL = 'https://www.cobtel.com'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function ensureDir(dir) {
  try {
    await access(dir)
  } catch {
    await mkdir(dir, { recursive: true })
  }
}

/** 把 URL 里的 ?size=... 之类后缀去掉，拿原图 */
function stripSizeQuery(url) {
  if (!url) return url
  return url.replace(/\?size=\d+x\d+&?$/, '').replace(/&size=\d+x\d+$/, '')
}

/** 补全 URL（相对路径 → 绝对） */
function absUrl(href, base) {
  if (!href) return ''
  if (href.startsWith('http')) return href
  if (href.startsWith('//')) return 'https:' + href
  if (href.startsWith('/')) return BASE_URL + href
  return new URL(href, base).href
}

/** 从 URL 下载图片到本地，返回 /products/xxx 相对路径或 null */
async function downloadImage(page, url, fileName) {
  try {
    const resp = await page.request.get(url, {
      headers: { 'User-Agent': USER_AGENT, Referer: BASE_URL },
    })
    if (!resp.ok()) throw new Error(`HTTP ${resp.status()}`)
    const buffer = await resp.body()
    const filePath = join(IMG_DIR, fileName)
    await writeFile(filePath, buffer)
    return `/products/${fileName}`
  } catch (e) {
    console.warn(`  ⚠️ 图片下载失败 ${url}: ${e.message}`)
    return null
  }
}

/** 1) 抓首页菜单 → 顶级分类（带产品的） */
async function discoverTopCategories(page) {
  console.log('🔍 步骤 1: 抓取首页菜单，识别顶级产品分类...')
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await sleep(800)

  const tops = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a.inmenu_1'))
      .map((a) => ({ name: a.textContent.trim(), href: a.getAttribute('href') }))
      .filter((x) => x.href)
  })
  console.log(`  ✓ 顶级分类: ${tops.map((t) => t.name).join(' | ')}`)
  return tops
}

/** 2) 抓取顶级分类页 → 找出它下面所有二级子分类（产品列表页） */
async function discoverSubCategories(page, top) {
  console.log(`\n📂 抓取顶级: ${top.name} (${top.href})`)
  await page.goto(top.href, { waitUntil: 'networkidle', timeout: 60000 })
  await sleep(1000)

  const subs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.LiLevel2 a'))
      .map((a) => ({ name: a.textContent.trim(), href: a.getAttribute('href') }))
      .filter((x) => x.href)
  })
  // 去重 + 补全 URL
  const seen = new Set()
  const unique = []
  for (const s of subs) {
    const abs = s.href.startsWith('http') ? s.href : new URL(s.href, location.href).href
    if (!seen.has(abs)) {
      seen.add(abs)
      unique.push({ name: s.name, href: abs, topName: null })
    }
  }
  console.log(`  ✓ 子分类: ${unique.length} 个`)
  return unique
}

/** 3) 在子分类页找产品 */
async function discoverProductsInCategory(page, sub) {
  console.log(`  📄 子分类: ${sub.name} (${sub.href})`)
  await page.goto(sub.href, { waitUntil: 'networkidle', timeout: 60000 })
  await sleep(1200)

  const products = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('.products-list-box').forEach((card) => {
      const linkEl = card.querySelector('a.products-item-name')
      if (!linkEl) return
      const href = linkEl.getAttribute('href')
      if (!href) return
      const url = href.startsWith('http') ? href : new URL(href, location.href).href
      const name = linkEl.textContent.trim()
      const imgEl =
        card.querySelector('.products-list-img img') ||
        card.querySelector('img')
      const img = imgEl
        ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '')
        : ''
      out.push({ url, name, image: img })
    })
    return out
  })

  // 翻页
  const pageLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.pagination a, .pages a, [class*="page"] a'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && /\/\d+\.html$/.test(h) || (h && /[?&]page=/.test(h)))
  })
  // 简化:暂时只抓第一页
  console.log(`    ✓ 找到 ${products.length} 个产品`)
  return products
}

/** 4) 抓产品详情 */
async function scrapeProductDetail(page, url) {
  console.log(`    📦 ${url}`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await sleep(1000)

  const data = await page.evaluate(() => {
    const text = (sel) => document.querySelector(sel)?.textContent?.trim() || ''
    const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) || ''
    const allText = (sel) =>
      Array.from(document.querySelectorAll(sel))
        .map((e) => e.textContent.trim())
        .filter(Boolean)

    // 标题
    const name = (
      text('.prodetails-name') ||
      text('h1')
    ).trim()

    // 简介
    const brief = text('.pdshow-r-text')

    // 完整描述 (HTML)
    const descEl = document.querySelector('.prodetails-box-cont')
    const description = descEl ? descEl.innerHTML.trim() : ''

    // 主图集
    const images = []
    const seen = new Set()
    const push = (src, alt) => {
      if (!src) return
      const clean = src.replace(/\?size=\d+x\d+&?$/, '').replace(/&size=\d+x\d+$/, '')
      if (seen.has(clean)) return
      seen.add(clean)
      images.push({ src: clean, alt: alt || name })
    }
    // 缩略图组
    document.querySelectorAll('#gallery .swiper-slide img, .thumbnail-box img').forEach((img) => {
      push(img.getAttribute('src') || img.getAttribute('data-src'), img.getAttribute('alt'))
    })
    // 主图
    document.querySelectorAll('.preview-container .small-box img, .big-box img').forEach((img) => {
      push(img.getAttribute('src') || img.getAttribute('data-src'), img.getAttribute('alt'))
    })
    if (images.length === 0) {
      const og = attr('meta[property="og:image"]', 'content')
      if (og) push(og, name)
    }

    // 面包屑
    const breadcrumbs = allText('.prodetails-page a')

    // 规格 (页面里没有标准 table，但 description 里可能含表格)
    const specs = []
    document.querySelectorAll('.prodetails-box-cont table tr').forEach((row) => {
      const cells = row.querySelectorAll('th, td')
      if (cells.length >= 2) {
        const key = cells[0].textContent.trim().replace(/[:：]\s*$/, '')
        const value = cells[1].textContent.trim()
        if (key && value && key.length < 50 && value.length < 200) {
          specs.push({ key, value })
        }
      }
    })

    return { name, brief, description, images, specs, breadcrumbs }
  })

  return { ...data, sourceUrl: url }
}

/** 主流程 */
async function main() {
  console.log('🚀 启动 COBTEL 产品抓取 (v2)')
  console.log('='.repeat(60))

  await ensureDir(DATA_DIR)
  await ensureDir(IMG_DIR)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  })
  const page = await context.newPage()

  try {
    // 1) 顶级分类
    const topCats = await discoverTopCategories(page)

    // 2) 遍历顶级 → 收所有子分类
    let allSubs = []
    for (const top of topCats) {
      try {
        const subs = await discoverSubCategories(page, top)
        subs.forEach((s) => (s.topName = top.name))
        allSubs.push(...subs)
      } catch (e) {
        console.warn(`  ⚠️ 顶级抓取失败 ${top.href}: ${e.message}`)
      }
    }
    console.log(`\n📊 共 ${allSubs.length} 个子分类`)

    // 3) 遍历子分类 → 收产品
    const productList = []
    for (const sub of allSubs) {
      try {
        const items = await discoverProductsInCategory(page, sub)
        items.forEach((p) => (p.category = sub.name))
        productList.push(...items)
      } catch (e) {
        console.warn(`  ⚠️ 子分类抓取失败 ${sub.href}: ${e.message}`)
      }
      await sleep(300)
    }

    // 去重
    const uniqueProducts = Array.from(
      new Map(productList.map((p) => [p.url, p])).values(),
    )
    console.log(`\n✓ 共发现 ${uniqueProducts.length} 个独立产品链接`)

    if (uniqueProducts.length === 0) {
      console.warn('\n⚠️ 没找到产品。')
      process.exit(1)
    }

    // 4) 抓详情 + 下载图片
    console.log(`\n📦 步骤 3: 抓取每个产品详情（共 ${uniqueProducts.length} 个）...`)
    const detailedProducts = []
    let imgCounter = 0

    for (let i = 0; i < uniqueProducts.length; i++) {
      const p = uniqueProducts[i]
      try {
        const detail = await scrapeProductDetail(page, p.url)

        const localImages = []
        for (let j = 0; j < detail.images.length && j < 6; j++) {
          imgCounter++
          const src = stripSizeQuery(detail.images[j].src)
          const m = src.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
          const ext = m ? m[1] : 'jpg'
          const fileName = `cobtel-${Date.now()}-${imgCounter}.${ext}`
          const localPath = await downloadImage(page, src, fileName)
          if (localPath) localImages.push(localPath)
        }

        if (detail.name) {
          detailedProducts.push({
            id: `cobtel-${i + 1}`,
            slug: detail.name
              .toLowerCase()
              .replace(/[^a-z0-9一-龥]+/g, '-')
              .replace(/^-|-$/g, '')
              .substring(0, 80),
            sku: `COBTEL-${i + 1}`,
            name: { en: detail.name, zh: detail.name },
            brief: { en: detail.brief || '', zh: detail.brief || '' },
            description: { en: detail.description || '', zh: detail.description || '' },
            category: p.category || 'General',
            images: localImages,
            specifications: detail.specs,
            sourceUrl: detail.sourceUrl,
            scrapedAt: new Date().toISOString(),
          })
          console.log(
            `    ✓ [${i + 1}/${uniqueProducts.length}] ${detail.name} (${localImages.length} 张图)`,
          )
        }
      } catch (e) {
        console.warn(`    ⚠️ 抓取失败 ${p.url}: ${e.message}`)
      }
      await sleep(400)
    }

    // 5) 保存 JSON
    await writeFile(OUTPUT_JSON, JSON.stringify(detailedProducts, null, 2), 'utf-8')
    console.log(`\n✅ 完成！`)
    console.log(`   产品数据：${OUTPUT_JSON}`)
    console.log(`   产品图片：${IMG_DIR}`)
    console.log(`   共抓取：${detailedProducts.length} 个产品`)
  } catch (e) {
    console.error('\n❌ 抓取过程出错:', e)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
