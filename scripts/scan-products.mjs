#!/usr/bin/env node
/**
 * 扫描 public/products/ 下的所有图片,生成 data/products.json
 *
 * 用法:
 *   node scripts/scan-products.mjs
 *
 * 规则:
 *   - 4 个老占位产品(cat6-lan / fiber-optic / power-cable / solar-cable + xlpe-power)用预置的完整数据
 *   - cobtel-*.jpg 走 COBTEL 拉下来的产品,按文件名分类归入对应产品线
 *   - 自动生成 slug / SKU / 名称 / 简短描述
 *
 * 输出:
 *   data/products.json
 *   data/categories.json
 */

import { readdir, writeFile, mkdir, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const IMG_DIR = join(PROJECT_ROOT, 'public', 'products')
const DATA_DIR = join(PROJECT_ROOT, 'data')
const OUT_PRODUCTS = join(DATA_DIR, 'products.json')
const OUT_CATEGORIES = join(DATA_DIR, 'categories.json')

// ============ 数据模板 ============

const CATEGORIES = [
  { slug: 'network-cable',  name: { en: 'Network Cable',  zh: '网络线缆' },  order: 1 },
  { slug: 'fiber-optic',     name: { en: 'Fiber Optic',    zh: '光纤光缆' },  order: 2 },
  { slug: 'power-cable',    name: { en: 'Power Cable',    zh: '电力电缆' },  order: 3 },
  { slug: 'solar-cable',    name: { en: 'Solar Cable',    zh: '太阳能电缆' }, order: 4 },
  { slug: 'rj45-connector', name: { en: 'RJ45 Connector', zh: 'RJ45 连接器' }, order: 5 },
  { slug: 'keystone-jack',  name: { en: 'Keystone Jack',  zh: ' Keystone' },  order: 6 },
  { slug: 'patch-panel',    name: { en: 'Patch Panel',    zh: '配线架' },     order: 7 },
  { slug: 'cable-manager',  name: { en: 'Cable Manager',  zh: '理线器' },     order: 8 },
]

// 4 个原占位产品 (有完整文案,优先保留)
const PLACEHOLDERS = [
  {
    image: 'xlpe-power.jpg',
    category: 'power-cable',
    name: { en: 'XLPE Insulated Power Cable', zh: 'XLPE 绝缘电力电缆' },
    sku: 'DT-PWR-XLPE-001',
    shortDescription: {
      en: '0.6/1kV low voltage XLPE power cable for industrial installations',
      zh: '0.6/1kV 低压 XLPE 电力电缆,工业级',
    },
    description: {
      en: 'Our XLPE insulated power cable is manufactured with high-purity copper conductors and cross-linked polyethylene insulation, offering excellent electrical performance, thermal resistance up to 90°C, and superior mechanical strength.',
      zh: 'XLPE 绝缘电力电缆采用高纯度铜芯导体和交联聚乙烯绝缘材料,具有优异的电气性能、耐温达 90°C,以及卓越的机械强度。',
    },
    specifications: [
      { key: { en: 'Conductor', zh: '导体' }, value: 'Class 2 stranded copper' },
      { key: { en: 'Insulation', zh: '绝缘' }, value: 'XLPE' },
      { key: { en: 'Rated Voltage', zh: '额定电压' }, value: '0.6/1 kV' },
      { key: { en: 'Max Temp', zh: '最高温度' }, value: '90°C (operating)' },
      { key: { en: 'Standard', zh: '标准' }, value: 'IEC 60502-1' },
    ],
  },
  {
    image: 'fiber-optic.jpg',
    category: 'fiber-optic',
    name: { en: 'Single-mode Fiber Optic Cable', zh: '单模光纤光缆' },
    sku: 'DT-FO-SM-G652D',
    shortDescription: {
      en: 'G.652D single-mode fiber, 4-144 cores, outdoor aerial & duct',
      zh: 'G.652D 单模光纤,4-144 芯,室外架空与管道',
    },
    description: {
      en: 'High-performance single-mode optical fiber cable featuring G.652D standard fiber with low attenuation and high bandwidth.',
      zh: '高性能单模光纤光缆,采用 G.652D 标准光纤,具有低衰减、高带宽特性。',
    },
    specifications: [
      { key: { en: 'Fiber Type', zh: '光纤类型' }, value: 'G.652D' },
      { key: { en: 'Attenuation', zh: '衰减' }, value: '≤0.35 dB/km @ 1310nm' },
      { key: { en: 'Core Count', zh: '芯数' }, value: '4-144 cores' },
    ],
  },
  {
    image: 'cat6-lan.jpg',
    category: 'network-cable',
    name: { en: 'CAT6 UTP LAN Cable', zh: 'CAT6 UTP 网络线' },
    sku: 'DT-LAN-CAT6-UTP',
    shortDescription: {
      en: '23AWG bare copper, 550MHz, PVC/LSZH jacket options',
      zh: '23AWG 裸铜,550MHz,PVC/LSZH 护套可选',
    },
    description: {
      en: 'High-quality Category 6 UTP LAN cable with 23AWG bare copper conductors. Supports 550MHz bandwidth and 10Gbps data rates.',
      zh: '高品质六类 UTP 网络线,23AWG 裸铜导体。支持 550MHz 带宽和 10Gbps 数据传输速率。',
    },
    specifications: [
      { key: { en: 'Category', zh: '类别' }, value: 'CAT6 UTP' },
      { key: { en: 'Conductor', zh: '导体' }, value: '23AWG bare copper' },
      { key: { en: 'Bandwidth', zh: '带宽' }, value: '550 MHz' },
    ],
  },
  {
    image: 'solar-cable.jpg',
    category: 'solar-cable',
    name: { en: 'Solar DC Cable', zh: '太阳能直流电缆' },
    sku: 'DT-SOL-DC-1500V',
    shortDescription: {
      en: 'TUV certified, 1.5kV DC, UV resistant for PV systems',
      zh: 'TUV 认证,1.5kV DC,PV 系统抗紫外线',
    },
    description: {
      en: 'TUV-certified solar DC cable designed for photovoltaic systems with excellent UV, ozone, and weather resistance.',
      zh: 'TUV 认证的太阳能直流电缆,采用电子束交联 XLPO 绝缘,具有出色的抗紫外线与耐候性能。',
    },
    specifications: [
      { key: { en: 'Rated Voltage', zh: '额定电压' }, value: '1.5 kV DC' },
      { key: { en: 'Insulation', zh: '绝缘' }, value: 'XLPO' },
      { key: { en: 'Operating Temp', zh: '工作温度' }, value: '-40°C to +120°C' },
    ],
  },
]

// 通用 COBTEL 拉下来的产品(按文件名后缀的 hash 派分类)
const ROUND_ROBIN_CATS = [
  'rj45-connector', 'rj45-connector', 'rj45-connector',
  'keystone-jack',  'keystone-jack',
  'patch-panel',    'patch-panel',
  'cable-manager',
  'fiber-optic', 'fiber-optic',
  'network-cable', 'network-cable',
  'power-cable',
]

function slugify(s) {
  return s.toLowerCase().replace(/\.jpg$/i, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
}

function titleFromSlug(slug) {
  // cobtel-1781620511653-27  →  COBTEL Product 027
  const m = slug.match(/cobtel-(\d+)-(\d+)/i)
  if (m) return `COBTEL Product #${m[2].padStart(3, '0')}`
  // 其它: 简短化
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function ensureDir(dir) {
  try { await access(dir) } catch { await mkdir(dir, { recursive: true }) }
}

async function main() {
  await ensureDir(DATA_DIR)
  const files = (await readdir(IMG_DIR)).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort()

  const products = []
  let order = 1
  const placeholderImgs = new Set(PLACEHOLDERS.map((p) => p.image))

  // 1) 先放 placeholder (按原始定义顺序)
  for (const ph of PLACEHOLDERS) {
    if (!files.includes(ph.image)) continue
    products.push({
      id: String(order),
      slug: slugify(ph.image.replace(/\.jpg$/i, '')),
      sku: ph.sku,
      name: ph.name,
      shortDescription: ph.shortDescription,
      description: ph.description,
      category: ph.category,
      images: [`/products/${ph.image}`],
      specifications: ph.specifications,
      moq: { en: 'Negotiable', zh: '可议' },
      leadTime: { en: '15-25 working days', zh: '15-25 个工作日' },
      origin: { en: 'Shenzhen, China', zh: '中国深圳' },
      featured: order <= 4,
      order: order++,
      source: 'placeholder',
    })
  }

  // 2) 接着 cobtel-* 图,按文件名字符串 hash 派分类
  const cobtelImgs = files.filter((f) => f.startsWith('cobtel-'))
  cobtelImgs.forEach((file, i) => {
    const slug = slugify(file)
    // 简单分类策略: 用 hash % 类别数
    const h = createHash('md5').update(file).digest()
    const catIdx = h[0] % ROUND_ROBIN_CATS.length
    const cat = ROUND_ROBIN_CATS[catIdx]
    const name = titleFromSlug(slug)
    products.push({
      id: String(order),
      slug,
      sku: `DT-${cat.toUpperCase().replace(/-/g, '')}-${String(order).padStart(3, '0')}`,
      name: { en: name, zh: name },
      shortDescription: {
        en: `High-quality ${cat.replace(/-/g, ' ')} solution. Contact us for specifications and quotation.`,
        zh: `高品质 ${cat.replace(/-/g, ' ')} 解决方案,联系我们获取详细规格与报价。`,
      },
      description: {
        en: 'Imported from COBTEL product catalog. Full specifications and datasheet available upon inquiry. OEM/ODM service supported.',
        zh: '来自 COBTEL 产品目录。完整规格与规格书可在询盘后提供,支持 OEM/ODM 定制。',
      },
      category: cat,
      images: [`/products/${file}`],
      specifications: [],
      moq: { en: 'Negotiable', zh: '可议' },
      leadTime: { en: '15-25 working days', zh: '15-25 个工作日' },
      origin: { en: 'Shenzhen, China', zh: '中国深圳' },
      featured: false,
      order: order++,
      source: 'cobtel',
    })
  })

  // 3) 任何不在 placeholder 也不以 cobtel- 开头的图,同样兜底收录
  for (const f of files) {
    if (placeholderImgs.has(f)) continue
    if (f.startsWith('cobtel-')) continue
    const slug = slugify(f)
    const h = createHash('md5').update(f).digest()
    const cat = ROUND_ROBIN_CATS[h[0] % ROUND_ROBIN_CATS.length]
    products.push({
      id: String(order),
      slug,
      sku: `DT-EXTRA-${String(order).padStart(3, '0')}`,
      name: { en: titleFromSlug(slug), zh: titleFromSlug(slug) },
      shortDescription: {
        en: 'B2B connectivity solution. Contact us for details.',
        zh: 'B2B 连接产品,详情请联系销售。',
      },
      description: {
        en: 'Contact our sales team for detailed specifications and quotation.',
        zh: '请联系销售团队获取详细规格与报价。',
      },
      category: cat,
      images: [`/products/${f}`],
      specifications: [],
      moq: { en: 'Negotiable', zh: '可议' },
      leadTime: { en: '15-25 working days', zh: '15-25 个工作日' },
      origin: { en: 'Shenzhen, China', zh: '中国深圳' },
      featured: false,
      order: order++,
      source: 'extra',
    })
  }

  // 4) 计算每个分类的统计
  const catStats = {}
  for (const p of products) {
    catStats[p.category] = (catStats[p.category] || 0) + 1
  }
  const categories = CATEGORIES.map((c) => ({
    ...c,
    count: catStats[c.slug] || 0,
    sampleImage: products.find((p) => p.category === c.slug)?.images[0] || '/products/xlpe-power.jpg',
  }))

  await writeFile(OUT_PRODUCTS, JSON.stringify(products, null, 2), 'utf-8')
  await writeFile(OUT_CATEGORIES, JSON.stringify(categories, null, 2), 'utf-8')

  console.log(`✓ 扫描 ${files.length} 张图片,生成 ${products.length} 个产品`)
  console.log(`  - placeholder: ${products.filter((p) => p.source === 'placeholder').length}`)
  console.log(`  - cobtel:      ${products.filter((p) => p.source === 'cobtel').length}`)
  console.log(`  - extra:       ${products.filter((p) => p.source === 'extra').length}`)
  console.log(`✓ 分类: ${categories.length} 个`)
  console.log(`  输出: ${OUT_PRODUCTS}`)
  console.log(`        ${OUT_CATEGORIES}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
