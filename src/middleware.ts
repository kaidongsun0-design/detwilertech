import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 跳过 Next.js 内部路由、静态资源、API、Payload admin
  matcher: [
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
}
