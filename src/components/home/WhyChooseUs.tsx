import { useTranslations } from 'next-intl'
import { ShieldCheck, Wrench, Truck, HeadphonesIcon } from 'lucide-react'

const icons = {
  quality: ShieldCheck,
  oem: Wrench,
  fastDelivery: Truck,
  support: HeadphonesIcon,
} as const

export function WhyChooseUs() {
  const t = useTranslations('home')

  const reasons = ['quality', 'oem', 'fastDelivery', 'support'] as const

  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('whyChooseUs')}</h2>
          <p className="mt-3 text-muted-foreground">{t('whyChooseUsDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((key) => {
            const Icon = icons[key]
            return (
              <div
                key={key}
                className="relative p-6 bg-background rounded-xl border hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(`reasons.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`reasons.${key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
