import type { Metadata } from 'next'
import Script from 'next/script'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Package, MapPin, Clock, Award, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InquiryActions } from '@/components/inquiry/InquiryActions'
import {
  getProductBySlug,
  getRelatedProducts,
  getCategoryBySlug,
  getAllProducts,
} from '@/lib/products'
import { clientEnv } from '@/lib/env'
import { ProductGallery } from '@/components/product/ProductGallery'
import { stripHtml } from '@/lib/utils'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }))
}

interface PageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: 'Not Found' }
  const loc = locale as 'en' | 'zh'
  const name = product.name[loc]
  const desc =
    product.shortDescription?.[loc] ??
    product.brief?.[loc] ??
    product.description[loc].slice(0, 160) ??
    name
  return {
    title: name,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      images: product.images.slice(0, 1).map((src) => ({ url: src })),
      type: 'website',
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const product = getProductBySlug(slug)
  if (!product) notFound()
  return <ProductDetailContent slug={slug} />
}

function ProductDetailContent({ slug }: { slug: string }) {
  const t = useTranslations('products')
  const locale = useLocale() as 'en' | 'zh'
  const product = getProductBySlug(slug)!
  const category = getCategoryBySlug(product.category)
  const related = getRelatedProducts(slug, 4)
  const origin = clientEnv.siteUrl
  const productUrl = `${origin}/${locale}/products/${product.slug}`

  // JSON-LD Product schema
  const desc =
    product.shortDescription?.en ??
    product.brief?.en ??
    product.description?.en?.slice(0, 160) ??
    ''
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name.en,
    description: desc,
    sku: product.sku,
    image: product.images.map((img) => (img.startsWith('http') ? img : origin + img)),
    brand: { '@type': 'Brand', name: clientEnv.siteName },
    category: category?.name.en,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      price: '0.00',
      priceValidUntil: '2030-12-31',
      url: productUrl,
      seller: { '@type': 'Organization', name: clientEnv.siteName },
    },
  }

  return (
    <div className="bg-background">
      {/* JSON-LD — 必须用 next/script,React 19 在 body 里禁止裸 inline <script> */}
      <Script
        id={`ld-product-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container py-3 flex items-center gap-2 text-sm flex-wrap">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <Link href="/products">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('backToList')}
            </Link>
          </Button>
          {category && (
            <>
              <span className="text-muted-foreground">/</span>
              <Link
                href={`/products/category/${category.slug}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {category.name[locale]}
              </Link>
            </>
          )}
          <span className="text-muted-foreground">/</span>
          <span className="truncate font-medium">{product.name[locale]}</span>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左侧：多图轮播 */}
          <ProductGallery images={product.images} name={product.name[locale]} />

          {/* 右侧：信息 + 询盘 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <Badge variant="secondary" className="text-xs">
                    {category.name[locale]}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs font-mono">
                  SKU: {product.sku}
                </Badge>
                {product.source === 'cobtel' && (
                  <Badge variant="outline" className="text-xs">
                    {locale === 'zh' ? 'COBTEL 货源' : 'From COBTEL'}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                {product.name[locale]}
              </h1>
              {(product.shortDescription || product.brief) && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {stripHtml(
                    product.shortDescription?.[locale] ||
                    product.brief?.[locale] ||
                    product.shortDescription?.en ||
                    product.brief?.en ||
                    ''
                  )}
                </p>
              )}
            </div>

            {/* 关键参数快速预览 */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y">
              <SpecItem
                icon={Package}
                label={locale === 'zh' ? '最小起订量' : 'MOQ'}
                value={product.moq?.[locale] ?? product.moq?.en ?? '—'}
              />
              <SpecItem
                icon={Clock}
                label={locale === 'zh' ? '交期' : 'Lead Time'}
                value={product.leadTime?.[locale] ?? product.leadTime?.en ?? '—'}
              />
              <SpecItem
                icon={MapPin}
                label={locale === 'zh' ? '产地' : 'Origin'}
                value={product.origin?.[locale] ?? product.origin?.en ?? '—'}
              />
            </div>

            {/* 询盘三入口 */}
            <InquiryActions product={product} />

            {/* 下载按钮 (Phase 2 接入真实 PDF) */}
            <Button variant="outline" className="w-full gap-2" disabled>
              <FileDown className="h-4 w-4" />
              {t('downloadPdf')}
            </Button>
          </div>
        </div>

        {/* 描述 + 规格表 + 相关产品 */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">{t('description')}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {stripHtml(
                  product.description?.[locale] ||
                  product.description?.en ||
                  (locale === 'zh' ? '暂无详细描述，请联系我们获取更多信息。' : 'No description available. Contact us for more details.')
                )}
              </div>
            </section>

            {product.specifications.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('specifications')}</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                        >
                          <td className="px-4 py-3 font-medium border-r w-1/3">
                            {spec.key?.[locale] ?? spec.key?.en ?? ''}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* 侧边：相关产品 */}
          {related.length > 0 && (
            <aside className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Award className="h-4 w-4 text-brand-600" />
                {t('relatedProducts')}
              </h3>
              <div className="space-y-3">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="flex gap-3 p-3 rounded-lg border hover:border-brand-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-brand-50 shrink-0">
                      <img
                        src={p.images[0]}
                        alt={p.name[locale]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {p.name[locale]}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {p.sku}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
