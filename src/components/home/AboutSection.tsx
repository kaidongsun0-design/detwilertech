import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight } from 'lucide-react'

/**
 * AboutSection — 匹配参考站 "About Detwiler Tech" 区域
 * 左侧文字 + 右侧图片
 */
export function AboutSection() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* 左侧 — 文字 */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Anton, sans-serif' }}>
              {t('aboutTitle')}
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {t('aboutDesc').split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
            >
              {tCommon('learnMore')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 右侧 — 图片 */}
          <div className="relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src="https://img-va.myshopline.com/image/store/1781584901431/DETWILER-TECH-baner2.png?w=538&h=298"
                alt="About Detwiler Tech"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
