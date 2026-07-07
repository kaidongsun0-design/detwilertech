/**
 * 多币种配置
 *
 * 货币偏好:
 *   - 存 cookie `dt_currency`,7 天有效
 *   - 默认 USD
 *   - 客户端 hook useCurrency() 读取
 *
 * 接入:
 *   - Header 显示当前货币 + 下拉切换
 *   - 产品详情/列表未来用 formatPrice 展示
 */

export const CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP'] as const
export type Currency = (typeof CURRENCIES)[number]

export interface CurrencyInfo {
  code: Currency
  symbol: string
  label: string  // 英文标签
  /** 1 USD -> X 目标币 (固定示例汇率,生产应接实时 API) */
  rateFromUSD: number
  /** Intl locale 列表(Intl 选第一个) */
  locale: string
}

export const CURRENCY_TABLE: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$',    label: 'US Dollar',  rateFromUSD: 1.0,  locale: 'en-US' },
  CNY: { code: 'CNY', symbol: '¥',    label: '人民币',       rateFromUSD: 7.25, locale: 'zh-CN' },
  EUR: { code: 'EUR', symbol: '€',    label: 'Euro',        rateFromUSD: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£',    label: 'British Pound', rateFromUSD: 0.79, locale: 'en-GB' },
}

export const DEFAULT_CURRENCY: Currency = 'USD'

/** 把一个 USD 数字按目标货币格式化 */
export function formatPriceFromUSD(
  usdAmount: number,
  target: Currency = DEFAULT_CURRENCY,
  options: Intl.NumberFormatOptions = {},
): string {
  const info = CURRENCY_TABLE[target]
  const value = usdAmount * info.rateFromUSD
  try {
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      maximumFractionDigits: 2,
      ...options,
    }).format(value)
  } catch {
    return `${info.symbol}${value.toFixed(2)}`
  }
}

export function isCurrency(s: string | undefined | null): s is Currency {
  return !!s && (CURRENCIES as readonly string[]).includes(s)
}
