/**
 * 占位产品数据 — Phase 1 临时数据源
 * Phase 2 将从 Payload CMS 拉取真实数据
 */

export type LocalizedString = { en: string; zh: string }

export interface PlaceholderSpec {
  key: LocalizedString
  value: string
}

export interface PlaceholderProduct {
  id: string
  slug: string
  sku: string
  name: LocalizedString
  shortDescription: LocalizedString
  description: LocalizedString
  category: { slug: string; name: LocalizedString }
  images: string[]
  specifications: PlaceholderSpec[]
  moq: LocalizedString
  leadTime: LocalizedString
  origin: LocalizedString
  featured: boolean
}

export const placeholderProducts: PlaceholderProduct[] = [
  {
    id: '1',
    slug: 'xlpe-power-cable',
    sku: 'DT-PWR-XLPE-001',
    name: {
      en: 'XLPE Insulated Power Cable',
      zh: 'XLPE 绝缘电力电缆',
    },
    shortDescription: {
      en: '0.6/1kV low voltage XLPE power cable for industrial installations',
      zh: '0.6/1kV 低压 XLPE 电力电缆，工业级',
    },
    description: {
      en: 'Our XLPE insulated power cable is manufactured with high-purity copper conductors and cross-linked polyethylene insulation, offering excellent electrical performance, thermal resistance up to 90°C, and superior mechanical strength. Suitable for power distribution in industrial plants, commercial buildings, and underground installations.',
      zh: 'XLPE 绝缘电力电缆采用高纯度铜芯导体和交联聚乙烯绝缘材料，具有优异的电气性能、耐温达 90°C，以及卓越的机械强度。适用于工业厂房、商业建筑及地下敷设的电力配电系统。',
    },
    category: { slug: 'power-cable', name: { en: 'Power Cable', zh: '电力电缆' } },
    images: ['/products/power-cable.jpg'],
    specifications: [
      { key: { en: 'Conductor', zh: '导体' }, value: 'Class 2 stranded copper' },
      { key: { en: 'Insulation', zh: '绝缘' }, value: 'XLPE (Cross-linked polyethylene)' },
      { key: { en: 'Rated Voltage', zh: '额定电压' }, value: '0.6/1 kV' },
      { key: { en: 'Max Temp', zh: '最高温度' }, value: '90°C (operating), 250°C (short circuit)' },
      { key: { en: 'Cores', zh: '芯数' }, value: '1-5 cores' },
      { key: { en: 'Cross-section', zh: '截面积' }, value: '1.5mm² - 630mm²' },
      { key: { en: 'Standard', zh: '标准' }, value: 'IEC 60502-1, GB/T 12706' },
      { key: { en: 'Certification', zh: '认证' }, value: 'CE, RoHS, CCC' },
    ],
    moq: { en: '500 meters', zh: '500 米' },
    leadTime: { en: '15-25 working days', zh: '15-25 个工作日' },
    origin: { en: 'Shenzhen, China', zh: '中国深圳' },
    featured: true,
  },
  {
    id: '2',
    slug: 'fiber-optic-cable',
    sku: 'DT-FO-SM-G652D',
    name: {
      en: 'Single-mode Fiber Optic Cable',
      zh: '单模光纤光缆',
    },
    shortDescription: {
      en: 'G.652D single-mode fiber, 4-144 cores, outdoor aerial & duct',
      zh: 'G.652D 单模光纤，4-144 芯，室外架空与管道',
    },
    description: {
      en: 'High-performance single-mode optical fiber cable featuring G.652D standard fiber with low attenuation and high bandwidth. Available in 4 to 144 cores with various jacket options (PE, LSZH) for outdoor aerial, duct, and direct-buried installations. Suitable for telecom backbone, FTTH, and long-haul networks.',
      zh: '高性能单模光纤光缆，采用 G.652D 标准光纤，具有低衰减、高带宽特性。提供 4 至 144 芯多种规格，护套可选 PE 或 LSZH，适用于室外架空、管道及直埋敷设。可用于电信骨干网、FTTH 及长途网络。',
    },
    category: { slug: 'fiber-optic', name: { en: 'Fiber Optic', zh: '光纤光缆' } },
    images: ['/products/fiber-optic.jpg'],
    specifications: [
      { key: { en: 'Fiber Type', zh: '光纤类型' }, value: 'G.652D single-mode' },
      { key: { en: 'Attenuation', zh: '衰减' }, value: '≤0.35 dB/km @ 1310nm' },
      { key: { en: 'Core Count', zh: '芯数' }, value: '4-144 cores' },
      { key: { en: 'Jacket Material', zh: '护套材料' }, value: 'PE / LSZH / AT' },
      { key: { en: 'Tensile Strength', zh: '抗拉强度' }, value: '≥1500N (long term)' },
      { key: { en: 'Operating Temp', zh: '工作温度' }, value: '-40°C to +70°C' },
      { key: { en: 'Standard', zh: '标准' }, value: 'IEC 60794, YD/T 901' },
    ],
    moq: { en: '1 km', zh: '1 公里' },
    leadTime: { en: '10-20 working days', zh: '10-20 个工作日' },
    origin: { en: 'Shenzhen, China', zh: '中国深圳' },
    featured: true,
  },
  {
    id: '3',
    slug: 'cat6-lan-cable',
    sku: 'DT-LAN-CAT6-UTP',
    name: {
      en: 'CAT6 UTP LAN Cable',
      zh: 'CAT6 UTP 网络线',
    },
    shortDescription: {
      en: '23AWG bare copper, 550MHz, PVC/LSZH jacket options',
      zh: '23AWG 裸铜，550MHz，PVC/LSZH 护套可选',
    },
    description: {
      en: 'High-quality Category 6 UTP LAN cable with 23AWG bare copper conductors for superior conductivity. Supports 550MHz bandwidth and 10Gbps data rates. Available in PVC or LSZH jacket for different installation environments. Ideal for structured cabling, data centers, and enterprise networks.',
      zh: '高品质六类 UTP 网络线，23AWG 裸铜导体确保优异导电性。支持 550MHz 带宽和 10Gbps 数据传输速率。提供 PVC 或 LSZH 护套以适应不同安装环境。适用于结构化布线、数据中心和企业网络。',
    },
    category: { slug: 'network', name: { en: 'Network Cable', zh: '网络线缆' } },
    images: ['/products/cat6-lan.jpg'],
    specifications: [
      { key: { en: 'Category', zh: '类别' }, value: 'CAT6 UTP' },
      { key: { en: 'Conductor', zh: '导体' }, value: '23AWG bare copper' },
      { key: { en: 'Bandwidth', zh: '带宽' }, value: '550 MHz' },
      { key: { en: 'Data Rate', zh: '传输速率' }, value: 'Up to 10 Gbps' },
      { key: { en: 'Jacket', zh: '护套' }, value: 'PVC / LSZH / PE' },
      { key: { en: 'Length per box', zh: '每箱长度' }, value: '305m (1000ft)' },
      { key: { en: 'Standard', zh: '标准' }, value: 'TIA/EIA-568, ISO/IEC 11801' },
      { key: { en: 'Certification', zh: '认证' }, value: 'CE, RoHS, UL' },
    ],
    moq: { en: '10 boxes (3050m)', zh: '10 箱 (3050 米)' },
    leadTime: { en: '7-15 working days', zh: '7-15 个工作日' },
    origin: { en: 'Shenzhen, China', zh: '中国深圳' },
    featured: true,
  },
  {
    id: '4',
    slug: 'solar-dc-cable',
    sku: 'DT-SOL-DC-1500V',
    name: {
      en: 'Solar DC Cable',
      zh: '太阳能直流电缆',
    },
    shortDescription: {
      en: 'TUV certified, 1.5kV DC, UV resistant for PV systems',
      zh: 'TUV 认证，1.5kV DC，PV 系统抗紫外线',
    },
    description: {
      en: 'TUV-certified solar DC cable designed for photovoltaic systems. Features electron beam cross-linked XLPO insulation with excellent UV, ozone, and weather resistance. Rated for 1.5kV DC with operating temperature from -40°C to +120°C. Suitable for solar panel interconnection and PV plant installations.',
      zh: 'TUV 认证的太阳能直流电缆，专为光伏系统设计。采用电子束交联 XLPO 绝缘，具有出色的抗紫外线、抗臭氧和耐候性能。额定 1.5kV DC，工作温度 -40°C 至 +120°C。适用于太阳能电池板互连和光伏电站安装。',
    },
    category: { slug: 'solar', name: { en: 'Solar Cable', zh: '太阳能电缆' } },
    images: ['/products/solar-cable.jpg'],
    specifications: [
      { key: { en: 'Rated Voltage', zh: '额定电压' }, value: '1.5 kV DC' },
      { key: { en: 'Conductor', zh: '导体' }, value: 'Tinned copper (class 5)' },
      { key: { en: 'Insulation', zh: '绝缘' }, value: 'XLPO (cross-linked polyolefin)' },
      { key: { en: 'Operating Temp', zh: '工作温度' }, value: '-40°C to +120°C' },
      { key: { en: 'UV Resistance', zh: '抗紫外线' }, value: 'Excellent (EN 50289-4-17)' },
      { key: { en: 'Cross-section', zh: '截面积' }, value: '2.5mm² - 35mm²' },
      { key: { en: 'Standard', zh: '标准' }, value: 'EN 50618, IEC 62930' },
      { key: { en: 'Certification', zh: '认证' }, value: 'TUV, CE, RoHS' },
    ],
    moq: { en: '1000 meters', zh: '1000 米' },
    leadTime: { en: '10-20 working days', zh: '10-20 个工作日' },
    origin: { en: 'Shenzhen, China', zh: '中国深圳' },
    featured: true,
  },
]

/** 按 slug 获取产品 */
export function getProductBySlug(slug: string): PlaceholderProduct | undefined {
  return placeholderProducts.find((p) => p.slug === slug)
}

/** 按分类获取产品 */
export function getProductsByCategory(categorySlug: string): PlaceholderProduct[] {
  return placeholderProducts.filter((p) => p.category.slug === categorySlug)
}

/** 获取精选产品 */
export function getFeaturedProducts(): PlaceholderProduct[] {
  return placeholderProducts.filter((p) => p.featured)
}
