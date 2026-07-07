import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { getCategories } from '@/lib/products'

/**
 * ProductCategories — 参考站 text-columns-with-image 区域
 * 5 列图片 + 分类名称按钮
 */
export function ProductCategories() {
  const t = useTranslations('common')
  const locale = useLocale() as 'en' | 'zh'
  const categories = getCategories().slice(0, 5)

  // 参考站分类图片映射
  const categoryImages: Record<string, string> = {
    'fiber-optic': 'https://img-va.myshopline.com/image/store/1781584901431/1-25G.png?w=1000&h=1000',
    'rj45-plug': 'https://img-va.myshopline.com/image/store/1781584901431/CN-102M2-(6).jpg?w=1000&h=1000',
    'keystone-jack': 'https://img-va.myshopline.com/image/store/1781584901431/CN-101C-(6).jpg?w=1000&h=1000',
    'patch-panel': 'https://img-va.myshopline.com/image/store/1781584901431/CN-104EV-(6).jpg?w=1000&h=1000',
    'accessories': 'https://img-va.myshopline.com/image/store/1781584901431/-1000-006-6.jpg?w=1000&h=1000',
  }

  const displayCategories = categories.length > 0
    ? categories
    : [
        { slug: '1-25g-sfp', name: { en: '1.25 Gbps SFP', zh: '1.25 Gbps SFP' } },
        { slug: '10g-sfp', name: { en: '10G SFP+', zh: '10G SFP+' } },
        { slug: '25g-sfp28', name: { en: '25G SFP28', zh: '25G SFP28' } },
        { slug: '40g-qsfp', name: { en: '40G QSFP+', zh: '40G QSFP+' } },
        { slug: '100g-qsfp28', name: { en: '100G QSFP28', zh: '100G QSFP28' } },
      ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {displayCategories.map((cat) => {
            const imgSrc = categoryImages[cat.slug]
              || (cat as any).sampleImage
              || 'https://img-va.myshopline.com/image/store/1781584901431/1-25G.png?w=1000&h=1000'

            return (
              <div key={cat.slug} className="flex flex-col items-center text-center group">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="block w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4"
                >
                  <img
                    src={imgSrc}
                    alt={cat.name[locale] || (cat.name as any).en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="inline-block px-5 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-full hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                >
                  {cat.name[locale] || (cat.name as any).en}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
