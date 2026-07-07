/**
 * 询盘服务:写库 + 发邮件
 *
 * 写库:优先 Payload REST API (即使未启用 CMS 也会降级到本地 JSON)
 * 邮件:Resend 优先,无 key 时降级到控制台日志
 *
 * 不会因为邮件失败而拒绝写库 — 询盘记录是核心,通知是辅助
 */

import type { Product } from './products'

export interface InquiryInput {
  name: string
  company?: string
  email: string
  phone?: string
  country?: string
  quantity?: string
  message: string
  product?: string  // SKU
  productName?: string
  source?: 'form' | 'email' | 'whatsapp' | 'contact-page'
  locale?: 'en' | 'zh'
  /** 自动从请求注入 */
  ip?: string
  userAgent?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface InquiryRecord extends Required<Pick<InquiryInput, 'name' | 'email' | 'message'>> {
  id: string
  subject: string
  createdAt: string
  product: string | null
  productName: string | null
  source: InquiryInput['source']
  locale: InquiryInput['locale']
  status: 'new'
  company: string | null
  phone: string | null
  country: string | null
  quantity: string | null
  ip: string | null
  userAgent: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

function safeStr(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s : null
}

/** 校验基础字段 */
export function validateInquiry(input: Partial<InquiryInput>): string | null {
  if (!input.name?.trim()) return 'Name is required'
  if (!input.email?.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'Invalid email'
  if (!input.message?.trim() || input.message.trim().length < 5) {
    return 'Message must be at least 5 characters'
  }
  return null
}

/** 把 InquiryInput 标准化为 InquiryRecord */
export function normalize(input: InquiryInput): InquiryRecord {
  const product = safeStr(input.product)
  const productName = safeStr(input.productName)
  const subject = productName
    ? `Inquiry about ${productName}${input.quantity ? ` (${input.quantity})` : ''}`
    : `Website inquiry from ${input.name}`

  return {
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject,
    name: input.name.trim(),
    company: safeStr(input.company),
    email: input.email.trim().toLowerCase(),
    phone: safeStr(input.phone),
    country: safeStr(input.country),
    quantity: safeStr(input.quantity),
    message: input.message.trim(),
    product,
    productName,
    source: input.source ?? 'form',
    locale: input.locale ?? 'en',
    status: 'new',
    ip: safeStr(input.ip),
    userAgent: safeStr(input.userAgent),
    utmSource: safeStr(input.utmSource),
    utmMedium: safeStr(input.utmMedium),
    utmCampaign: safeStr(input.utmCampaign),
    createdAt: new Date().toISOString(),
  }
}
