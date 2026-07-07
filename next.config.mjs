import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * dev / build 输出目录物理隔离 — 避免互相覆盖导致空白页
 *   - dev   → .next-dev
 *   - build → .next
 * 默认按 NODE_ENV 自动判断,可用 NEXT_DIST_DIR 覆盖
 */
const distDir =
  process.env.NEXT_DIST_DIR ||
  (process.env.NODE_ENV === 'production' ? '.next' : '.next-dev')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Production: 阿里 OSS / Cloudflare R2
      { protocol: 'https', hostname: '**.aliyuncs.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
  },
  experimental: {
    // Payload 3 推荐
    reactCompiler: false,
  },
  // 优化 server external packages for Payload
  serverExternalPackages: ['libsql', '@libsql/client', 'better-sqlite3'],
}

export default withPayload(withNextIntl(nextConfig))
