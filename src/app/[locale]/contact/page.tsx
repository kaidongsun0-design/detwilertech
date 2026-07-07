import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InquiryForm } from '@/components/inquiry/InquiryActions'
import { clientEnv } from '@/lib/env'

export const metadata = {
  title: 'Contact Us',
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ContactContent />
}

function ContactContent() {
  const t = useTranslations('contact')
  const tNav = useTranslations('nav')
  const whatsappLink = `https://wa.me/${clientEnv.whatsappNumber}?text=${encodeURIComponent('Hello Detwiler Tech, I would like to inquire about your products.')}`

  const infoItems = [
    { icon: MapPin, key: 'address', value: clientEnv.address, href: null },
    { icon: Phone, key: 'phone', value: clientEnv.phone, href: `tel:${clientEnv.phone}` },
    { icon: Mail, key: 'email', value: clientEnv.salesEmail, href: `mailto:${clientEnv.salesEmail}` },
    { icon: MessageCircle, key: 'whatsapp', value: `+${clientEnv.whatsappNumber}`, href: whatsappLink },
    { icon: Clock, key: 'hours', value: t('hoursValue'), href: null },
  ] as const

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* 联系方式 */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">{t('infoTitle')}</h2>
            <div className="space-y-5">
              {infoItems.map(({ icon: Icon, key, value, href }) => {
                const inner = (
                  <>
                    <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t(key)}
                      </div>
                      <div className="font-medium mt-0.5 break-words">{value}</div>
                    </div>
                  </>
                )
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 hover:text-brand-600 transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={key} className="flex items-center gap-4">
                    {inner}
                  </div>
                )
              })}
            </div>
            <Button
              asChild
              className="w-full mt-6 bg-[#25D366] hover:bg-[#1DA851] gap-2"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us Now
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* 询盘表单 */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-2">{t('formTitle')}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {tNav('contact') === 'Contact' ? 'We respond within 24 hours.' : '我们将在 24 小时内回复。'}
            </p>
            <InquiryForm source="contact-page" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
