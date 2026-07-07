#!/usr/bin/env node
/** 看看 .products-list-box 内部结构 + 详情页结构 */
import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// 1) 看子分类页产品卡的内部结构
await page.goto('https://www.cobtel.com/rj45-modular-plug/cat5e-modular-plug/', {
  waitUntil: 'networkidle',
  timeout: 60000,
})
await page.waitForTimeout(1500)

const cardInfo = await page.evaluate(() => {
  const boxes = Array.from(document.querySelectorAll('.products-list-box'))
  return boxes.slice(0, 2).map((b) => ({
    html: b.outerHTML.slice(0, 1500),
    a: b.querySelector('a')?.getAttribute('href'),
    img: b.querySelector('img')?.getAttribute('src'),
    name: b.querySelector('.products-item-name')?.textContent.trim(),
  }))
})
console.log('=== .products-list-box 内部结构 (子分类页) ===')
console.log(JSON.stringify(cardInfo, null, 2))

// 2) 找一个产品详情 URL,看其结构
const detailUrl = cardInfo[0]?.a
  ? new URL(cardInfo[0].a, 'https://www.cobtel.com').href
  : 'https://www.cobtel.com/rj45-modular-plug/cat5e-modular-plug/cat5e-short-body-8p8c-industrial-rj-connector.html'
console.log('\n=== 抓详情页:', detailUrl)
await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

const detailInfo = await page.evaluate(() => {
  // 找详情页主要 class
  const allClass = new Map()
  document.querySelectorAll('[class]').forEach((el) => {
    const c = (el.className || '').trim()
    if (!c || c.length > 60) return
    allClass.set(c, (allClass.get(c) || 0) + 1)
  })
  const sorted = Array.from(allClass.entries())
    .filter(([_, n]) => n >= 1 && n < 20)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)

  // 找 h1 标题
  const h1 = document.querySelector('h1')?.textContent.trim()
  // 找产品图
  const imgs = Array.from(document.querySelectorAll('img'))
    .map((i) => i.getAttribute('src') || i.getAttribute('data-src') || '')
    .filter((s) => /uploads.*(small|big|large|normal)\//.test(s))
    .slice(0, 8)
  // 找描述
  const descs = Array.from(document.querySelectorAll('[class*="desc" i], [class*="intro" i], [class*="detail" i]'))
    .map((e) => ({ cls: e.className, text: e.textContent.trim().slice(0, 100) }))
    .filter((d) => d.text.length > 30)
    .slice(0, 5)
  // 找规格
  const tables = Array.from(document.querySelectorAll('table'))
    .map((t) => ({ cls: t.className, rows: t.querySelectorAll('tr').length }))
  return { h1, sorted, imgs, descs, tables }
})

console.log('h1:', detailInfo.h1)
console.log('main classes (top):')
detailInfo.sorted.forEach(([c, n]) => console.log(' ', n, c))
console.log('imgs:')
detailInfo.imgs.forEach((s) => console.log(' ', s))
console.log('descs:')
detailInfo.descs.forEach((d) => console.log(' ', d.cls, '->', d.text))
console.log('tables:')
detailInfo.tables.forEach((t) => console.log(' ', t.cls, 'rows=', t.rows))

// 把详情页 HTML 截个前 6KB 看
const html = await page.content()
const { writeFile } = await import('node:fs/promises')
await writeFile('D:/Tool/claude_web/detwilertech/.inspect/detail.html', html, 'utf-8')
console.log('\ndetail.html saved')

await browser.close()
