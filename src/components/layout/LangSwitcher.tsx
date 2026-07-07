'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

const languages = {
  en: { label: 'English', short: 'EN', flag: '🇺🇸' },
  zh: { label: '中文', short: '中', flag: '🇨🇳' },
} as const

export function LangSwitcher() {
  const locale = useLocale() as keyof typeof languages
  const router = useRouter()
  const pathname = usePathname()

  const otherLocale = locale === 'en' ? 'zh' : 'en'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.replace(pathname, { locale: otherLocale })}
      className="gap-2"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{languages[otherLocale].short}</span>
    </Button>
  )
}
