#!/usr/bin/env node
/** 深挖 — 找出产品列表页具体的 class 结构 */
import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

async function inspect(url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500)

  // 1) 抓 [class*=product] 的真实 className 分布
  const productClasses = await page.evaluate(() => {
    const map = new Map()
    document.querySelectorAll('[class*="product" i]').forEach((el) => {
      const c = el.className.trim()
      map.set(c, (map.get(c) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  })

  // 2) 抓所有 img 中 /uploads 路径中包含 36855/small 但不是 logo/banner 的(产品图)
  const productImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map((i) => ({
        src: i.getAttribute('src') || i.getAttribute('data-src') || '',
        alt: i.getAttribute('alt') || '',
        parentCls: i.parentElement?.className || '',
        gpCls: i.parentElement?.parentElement?.className || '',
        ggpCls: i.parentElement?.parentElement?.parentElement?.className || '',
      }))
      .filter((x) => /\/small\//.test(x.src))
      .slice(0, 12)
  })

  // 3) 抓所有 [class*=item] 真实 className 分布
  const itemClasses = await page.evaluate(() => {
    const map = new Map()
    document.querySelectorAll('[class*="item" i]').forEach((el) => {
      const c = el.className.trim()
      if (!c) return
      map.set(c, (map.get(c) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30)
  })

  // 4) 抓主内容区大致 HTML 片段(找产品容器)
  const mainHTML = await page.evaluate(() => {
    const candidates = [
      '.main',
      '.container',
      '.content',
      '.pro_list',
      '.product_list',
      '.products_list',
      '.goods_list',
      '.list',
      '[class*="list_box"]',
      '[class*="productsbox"]',
      '[class*="mainbox"]',
      'main',
    ]
    for (const sel of candidates) {
      const el = document.querySelector(sel)
      if (el && el.querySelectorAll('a[href*=".com/"]').length > 3) {
        return { sel, html: el.outerHTML.slice(0, 4000) }
      }
    }
    return { sel: null, html: '' }
  })

  return { url, productClasses, productImgs, itemClasses, mainHTML }
}

const r1 = await inspect('https://www.cobtel.com/products')
console.log('\n=== /products (Network Cabling 顶级) ===')
console.log('productClasses:', r1.productClasses)
console.log('itemClasses top:', r1.itemClasses)
console.log('mainSel:', r1.mainHTML.sel)
console.log('main sample:')
console.log(r1.mainHTML.html)
console.log('\nproductImgs:')
r1.productImgs.forEach((i) => console.log('  ', i.parentCls, '|', i.gpCls, '|', i.gpCls, '->', i.src))

// 取一个二级子分类页验证
const r2 = await inspect('https://www.cobtel.com/rj45-modular-plug/cat5e-modular-plug/')
console.log('\n=== /rj45-modular-plug/cat5e-modular-plug/ (子分类) ===')
console.log('productClasses:', r2.productClasses)
console.log('itemClasses top:', r2.itemClasses)
console.log('mainSel:', r2.mainHTML.sel)
console.log('main sample:')
console.log(r2.mainHTML.html)
console.log('\nproductImgs:')
r2.productImgs.forEach((i) => console.log('  ', i.parentCls, '|', i.gpCls, '->', i.src))

await browser.close()
