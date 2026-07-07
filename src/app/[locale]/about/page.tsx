import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Award, Globe, Package, Users } from 'lucide-react'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')

  const stats = [
    { icon: Globe, key: 'countries', value: '50+' },
    { icon: Award, key: 'experience', value: '15+' },
    { icon: Package, key: 'products', value: '200+' },
    { icon: Users, key: 'customers', value: '1000+' },
  ] as const

  return (
    <div className="container py-12 md:py-16">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Story & Mission */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-brand-50 to-background border">
          <h2 className="text-2xl font-bold mb-4">{t('story.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('story.content')}</p>
        </div>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-brand-50 to-background border">
          <h2 className="text-2xl font-bold mb-4">{t('mission.title')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('mission.content')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('stats.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, key, value }) => (
            <div key={key} className="text-center p-6 bg-background rounded-xl border">
              <Icon className="h-8 w-8 mx-auto mb-3 text-brand-600" />
              <div className="text-3xl md:text-4xl font-bold text-brand-600">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{t(`stats.${key}`)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('values.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['quality', 'integrity', 'innovation', 'partnership'] as const).map((key) => (
            <div key={key} className="p-6 text-center bg-muted/30 rounded-xl">
              <div className="font-semibold text-lg">{t(`values.items.${key}`)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
