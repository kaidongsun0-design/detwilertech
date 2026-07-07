import { z } from 'zod'

/**
 * 环境变量校验
 *
 * 服务端变量（PAYLOAD_SECRET, RESEND_API_KEY 等）— 仅服务端可访问
 * 客户端变量（NEXT_PUBLIC_*）— 浏览器可访问
 *
 * 不要在这里写默认值 — 环境变量必须显式提供；缺失应抛错
 */

const serverSchema = z.object({
  PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET 至少 16 字符'),
  DATABASE_URI: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  DIRECTMAIL_ACCESS_KEY: z.string().optional(),
  DIRECTMAIL_ACCESS_SECRET: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Detwiler Tech'),
  NEXT_PUBLIC_SALES_EMAIL: z.string().email().default('sales@detwilertech.com'),
  NEXT_PUBLIC_INFO_EMAIL: z.string().email().default('info@detwilertech.com'),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default('8613800000000'),
  NEXT_PUBLIC_PHONE: z.string().default('+86-138-0000-0000'),
  NEXT_PUBLIC_ADDRESS: z.string().default('Shenzhen, Guangdong, China'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
})

/** 客户端可访问的环境变量（构建期内联到 bundle）*/
export const clientEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Detwiler Tech',
  salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@detwilertech.com',
  infoEmail: process.env.NEXT_PUBLIC_INFO_EMAIL || 'info@detwilertech.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8613800000000',
  phone: process.env.NEXT_PUBLIC_PHONE || '+86-138-0000-0000',
  address: process.env.NEXT_PUBLIC_ADDRESS || 'Shenzhen, Guangdong, China',
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
}

/** 服务端环境变量校验 — 仅在 server action / route handler 中调用 */
export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ 环境变量校验失败:', parsed.error.flatten().fieldErrors)
    throw new Error('Missing or invalid environment variables')
  }
  return parsed.data
}
