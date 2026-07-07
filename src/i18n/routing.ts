import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'zh'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false,
})

// 类型化导航 API（替代 next/link）
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
