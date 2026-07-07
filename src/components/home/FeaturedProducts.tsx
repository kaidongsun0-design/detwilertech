'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'cat5e', label: 'CAT5E' },
  { key: 'cat6', label: 'CAT6' },
  { key: 'cat6a', label: 'CAT6A' },
  { key: 'cat8', label: 'CAT8' },
]

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const locale = useLocale() as 'en' | 'zh'
  const [activeTab, setActiveTab] = useState('cat5e')

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container">
        {/* 标题 */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10" style={{ fontFamily: 'Anton, sans-serif' }}>
          {t('featuredProducts')}
        </h2>

        {/* Tabs — 参考站粉色/米色风格 */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-[#f2beca] text-gray-900 shadow-sm'
                  : 'bg-[#f5eadb] text-gray-600 hover:bg-[#eddcc4]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 产品网格 — 参考站 5 列桌面 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              {/* 产品图片 */}
              <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name[locale]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* 快速添加按钮 — 悬浮显示 */}
                  <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {tCommon('quickAdd')}
                    </button>
                  </div>
                </div>
              </Link>

              {/* 产品名称 */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                  {product.name[locale]}
                </h3>
              </Link>

              {/* SKU 显示 */}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-red-600">
                  {product.sku}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
