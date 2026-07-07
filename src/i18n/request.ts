import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // 从 requestLocale 解析目标语言
  const requested = await requestLocale
  // next-intl 3.x 没有 hasLocale — 用 includes 手动校验
  const locale = (routing.locales as readonly string[]).includes(requested || '')
    ? (requested as 'en' | 'zh')
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
