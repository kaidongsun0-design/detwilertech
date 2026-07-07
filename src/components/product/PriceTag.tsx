'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { CURRENCY_TABLE, DEFAULT_CURRENCY, formatPriceFromUSD, isCurrency, type Currency } from '@/i18n/currency'

interface Props {
  /** 以 USD 计的金额 */
  usdAmount: number
  /** 显示前/后缀,例如 'From' / '起' */
  prefix?: string
  className?: string
}

/**
 * 客户端价格组件 — 跟随货币 Cookie 变化
 * 没具体价格时可传 0,显示 'Contact for quotation'
 */
export function PriceTag({ usdAmount, prefix, className }: Props) {
  const locale = useLocale() as 'en' | 'zh'
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)

  useEffect(() => {
    const m = document.cookie.match(/(^|; )dt_currency=([^;]*)/)
    const v = m?.[2]
    setCurrency(isCurrency(v) ? v : DEFAULT_CURRENCY)

    function handler(e: Event) {
      const c = (e as CustomEvent<Currency>).detail
      if (isCurrency(c)) setCurrency(c)
    }
    window.addEventListener('dt:currency-changed', handler as EventListener)
    return () => window.removeEventListener('dt:currency-changed', handler as EventListener)
  }, [])

  if (!usdAmount) {
    return (
      <div className={className}>
        <div className="text-xs text-muted-foreground">
          {locale === 'zh' ? '参考价' : 'Reference Price'}
        </div>
        <div className="text-base font-semibold text-brand-600">
          {locale === 'zh' ? '联系销售获取报价' : 'Contact for Quotation'}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">
        {prefix ? `${prefix} ` : ''}
        {CURRENCY_TABLE[currency].code}
      </div>
      <div className="text-2xl font-bold text-brand-600">
        {formatPriceFromUSD(usdAmount, currency)}
      </div>
    </div>
  )
}
