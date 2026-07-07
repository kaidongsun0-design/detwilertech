'use client'

import { useEffect, useState } from 'react'
import { DollarSign, ChevronDown } from 'lucide-react'
import {
  CURRENCIES,
  CURRENCY_TABLE,
  DEFAULT_CURRENCY,
  isCurrency,
  type Currency,
} from '@/i18n/currency'
import { cn } from '@/lib/utils'

const COOKIE = 'dt_currency'
const COOKIE_DAYS = 7

function setCookie(c: Currency) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + COOKIE_DAYS * 86400e3).toUTCString()
  document.cookie = `${COOKIE}=${c}; path=/; expires=${expires}; SameSite=Lax`
}

function readCookie(): Currency {
  if (typeof document === 'undefined') return DEFAULT_CURRENCY
  const m = document.cookie.match(new RegExp('(^|; )' + COOKIE + '=([^;]*)'))
  const v = m?.[2]
  return isCurrency(v) ? v : DEFAULT_CURRENCY
}

export function CurrencySwitcher({ className }: { className?: string }) {
  const [current, setCurrent] = useState<Currency>(DEFAULT_CURRENCY)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setCurrent(readCookie())
  }, [])

  function pick(c: Currency) {
    setCurrent(c)
    setCookie(c)
    setOpen(false)
    // 触发轻量重渲染:刷新页面让 SSR 重新计算(Phase 2 接实时价格时改为局部 state)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dt:currency-changed', { detail: c }))
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch currency"
      >
        <DollarSign className="h-3.5 w-3.5" />
        <span>{CURRENCY_TABLE[current].code}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <ul
            role="listbox"
            className="absolute right-0 mt-1 w-36 rounded-md border bg-background shadow-lg py-1 z-40"
          >
            {CURRENCIES.map((c) => {
              const info = CURRENCY_TABLE[c]
              const active = c === current
              return (
                <li key={c} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => pick(c)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm flex items-center justify-between gap-3 hover:bg-muted',
                      active && 'bg-brand-50 text-brand-700',
                    )}
                  >
                    <span className="font-medium">{info.code}</span>
                    <span className="text-xs text-muted-foreground">{info.symbol}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
