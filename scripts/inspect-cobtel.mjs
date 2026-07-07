#!/usr/bin/env node
/**
 * 临时探针 — 用 Playwright 打开 COBTEL 几个关键页,
 * 把 HTML / 关键 class / 链接 dump 出来,方便定位选择器
 */
import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '.inspect')
await mkdir(OUT_DIR, { recursive: true })

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

async function inspect(url, label) {
  console.log(`\n=== ${label} -> ${url} ===`)
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  } catch (e) {
    console.log(`goto warn: ${e.message}`)
  }
  // 触发可能存在的滚动/懒加载
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1500)

  // 1) 完整 HTML
  const html = await page.content()
  await writeFile(join(OUT_DIR, `${label}.html`), html, 'utf-8')

  // 2) 抓出所有 a 标签里包含 product / category / cable / fiber / 数字的
  const links = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('a[href]'))
    return all
      .map((a) => ({
        href: a.getAttribute('href'),
        text: (a.textContent || '').trim().slice(0, 80),
        cls: a.className || '',
        parentCls: a.parentElement?.className || '',
      }))
      .filter(
        (x) =>
          x.href &&
          !x.href.startsWith('#') &&
          !x.href.startsWith('javascript:') &&
          /product|category|cable|fiber|wire|cat6|cat5|lan|solar|power/i.test(x.href + ' ' + x.text),
      )
  })
  await writeFile(join(OUT_DIR, `${label}.links.json`), JSON.stringify(links, null, 2), 'utf-8')

  // 3) 抓出所有常见卡片 / 列表 class 的出现次数
  const classStats = await page.evaluate(() => {
    const sels = [
      '.product',
      '.products',
      '.product-item',
      '.product-card',
      '.product-list',
      '.pro-item',
      '.goods',
      '.goods-item',
      '.item',
      '.cat-item',
      '.category',
      '.categories',
      '[class*="product"]',
      '[class*="goods"]',
      '[class*="card"]',
      '[class*="gallery"]',
      '[class*="list"]',
      '[class*="grid"]',
      '[class*="item"]',
      '[class*="swiper"]',
      '[class*="slider"]',
    ]
    const out = {}
    for (const sel of sels) {
      try {
        const n = document.querySelectorAll(sel).length
        if (n > 0) out[sel] = n
      } catch {}
    }
    return out
  })

  // 4) 抓出所有 img 的 src (去重)
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map((i) => i.getAttribute('src') || i.getAttribute('data-src') || '')
      .filter(Boolean)
      .slice(0, 30)
  })

  console.log(`  links(${links.length})  classStats:`, classStats)
  console.log(`  imgs(0..30):`)
  imgs.slice(0, 10).forEach((s) => console.log('   ', s.slice(0, 120)))
}

await inspect('https://www.cobtel.com', 'home')
await inspect('https://www.cobtel.com/products', 'products')
await inspect('https://www.cobtel.com/production-capacity', 'production-capacity')

await browser.close()
console.log(`\n结果写入 ${OUT_DIR}`)
