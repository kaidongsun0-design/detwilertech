import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/products'

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }))
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params
  setRequestLocale(locale)
  const cat = getCategoryBySlug(category)
  if (!cat) notFound()
  return <CategoryContent categorySlug={category} />
}

function CategoryContent({ categorySlug }: { categorySlug: string }) {
  const t = useTranslations('products')
  const locale = useLocale() as 'en' | 'zh'
  const cat = getCategoryBySlug(categorySlug)!
  const products = getProductsByCategory(categorySlug)
  const allCats = getCategories()

  return (
    <div className="container py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <Link href="/products">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('backToList')}
          </Link>
        </Button>
      </div>

      {/* Title */}
      <div className="mb-10">
        <Badge variant="secondary" className="mb-3">
          {locale === 'zh' ? '产品分类' : 'Category'}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {cat.name[locale]}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {locale === 'zh' ? `共 ${products.length} 款产品` : `${products.length} products`}
        </p>
      </div>

      {/* 侧边分类切换 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/products">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted px-3 py-1.5">
            {locale === 'zh' ? '全部' : 'All'}
          </Badge>
        </Link>
        {allCats.map((c) => (
          <Link key={c.slug} href={`/products/category/${c.slug}`}>
            <Badge
              variant={c.slug === categorySlug ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-muted px-3 py-1.5"
            >
              {c.name[locale]} ({c.count})
            </Badge>
          </Link>
        ))}
      </div>

      {/* 产品网格 */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow overflow-hidden h-full">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name[locale]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {product.name[locale]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
