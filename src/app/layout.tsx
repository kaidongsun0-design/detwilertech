import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { clientEnv } from '@/lib/env'

export const metadata: Metadata = {
  title: {
    default: 'Detwiler Tech — Engineered for the Future of Connectivity',
    template: '%s — Detwiler Tech',
  },
  description:
    'Premium cable and connectivity solutions for telecom, power, and industrial applications. Trusted by partners across 50+ countries.',
  metadataBase: new URL(clientEnv.siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Detwiler Tech',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: clientEnv.siteName,
  url: clientEnv.siteUrl,
  logo: `${clientEnv.siteUrl}/logo.jpg`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Sales',
    email: clientEnv.salesEmail,
    telephone: clientEnv.phone,
    availableLanguage: ['English', 'Chinese'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: clientEnv.address,
  },
  sameAs: [
    // 留空,等运营补 LinkedIn / Facebook 等
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: clientEnv.siteName,
  url: clientEnv.siteUrl,
  inLanguage: ['en', 'zh'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        必须用 next/script,不能用裸 <script>。
        React 19 在 body 里渲染裸 inline <script> 会触发 hydration 失败并清空整棵树,
        错误信息: Cannot render a <script> outside the main document without
        `async={true}` and a non-empty `src` prop.
        next/script 会把这些 JSON-LD 注入初始 HTML,搜索引擎和 Googlebot 能读到。
      */}
      <Script
        id="ld-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {children}
    </>
  )
}