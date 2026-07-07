import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clientEnv } from '@/lib/env'

export function CTASection() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const whatsappLink = `https://wa.me/${clientEnv.whatsappNumber}?text=${encodeURIComponent('Hello Detwiler Tech, I would like to discuss a project.')}`

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-16 md:p-16 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 text-lg text-brand-50/90">
              {t('ctaDesc')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link href="/contact">
                  {tNav('contact')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
