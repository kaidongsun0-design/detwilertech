import { setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ProductCategories } from '@/components/home/ProductCategories'
import { AboutSection } from '@/components/home/AboutSection'
import { ContactForm } from '@/components/home/ContactForm'
import { BannerSection } from '@/components/home/BannerSection'
import { getAllProducts } from '@/lib/products'

const SECOND_BANNER = 'https://img-va.myshopline.com/image/store/1781584901431/ChatGPT-Image-2026-6-17-00-29-56.png?w=2155&h=730'
const THIRD_BANNER = 'https://img-va.myshopline.com/image/store/1781584901431/328d51f7-e33c-4173-a129-a62b20746a75-(1).png?w=964&h=301'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // 服务端加载产品数据 — 取前 10 个产品
  const products = getAllProducts().slice(0, 10)

  return (
    <>
      {/* 1. Hero — 全宽横幅轮播 (无 logo) */}
      <Hero />

      {/* 2. 产品精选 — 标签式产品网格 */}
      <FeaturedProducts products={products} />

      {/* 3. 第二横幅 */}
      <BannerSection src={SECOND_BANNER} alt="Solutions Banner" aspectW={2155} aspectH={730} />

      {/* 4. 产品分类 — 5 列图片卡片 */}
      <ProductCategories />

      {/* 5. 第三横幅 */}
      <BannerSection src={THIRD_BANNER} alt="Promo Banner" aspectW={964} aspectH={301} />

      {/* 6. 关于我们 */}
      <AboutSection />

      {/* 7. 联系表单 */}
      <ContactForm />
    </>
  )
}
