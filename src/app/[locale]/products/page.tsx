import { setRequestLocale } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Package, ArrowRight, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAllProducts, getCategories, getCategoryBySlug } from '@/lib/products'

export const dynamic = 'force-static'

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ProductsContent locale={locale} />
}

function ProductsContent({ locale }: { locale: string }) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const loc = locale as 'en' | 'zh'

  const allProducts = getAllProducts()
  const categories = getCategories()

  return (
    <div className="container py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{t('subtitle')}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('showingCount', { count: allProducts.length })}
        </p>
      </div>

      {/* 分类卡 */}
      <h2 className="text-xl font-semibold mb-6">{t('categories')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/products/category/${cat.slug}`}>
            <Card className="group hover:border-brand-300 hover:shadow-md transition-all cursor-pointer h-full overflow-hidden">
              <div className="aspect-[5/3] bg-gradient-to-br from-brand-50 to-brand-100 relative">
                <img
                  src={cat.sampleImage}
                  alt={cat.name[loc]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                  <div>
                    <div className="text-base font-semibold leading-tight drop-shadow">
                      {cat.name[loc]}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {cat.count} {loc === 'zh' ? '款' : 'items'}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* 全部产品 */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">
          {t('all')}
        </h2>
        <form className="relative w-full md:w-72" action="">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allProducts.map((product) => {
          const cat = getCategoryBySlug(product.category)
          return (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow overflow-hidden h-full">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name[loc]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {cat && (
                    <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider font-medium bg-white/90 backdrop-blur px-2 py-1 rounded">
                      {cat.name[loc]}
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {product.name[loc]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {allProducts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('noProducts')}</p>
        </div>
      )}
    </div>
  )
}
