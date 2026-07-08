/**
 * 询盘提交 API route
 *
 * POST /api/inquiries
 *   body: InquiryInput
 *   response: { ok: true, id } | { ok: false, error }
 *
 * 使用 Payload local API 写入数据库（兼容 Vercel serverless）。
 * 同时异步发邮件通知（如配置了 RESEND_API_KEY）。
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { InquiryInput, validateInquiry } from '@/lib/inquiry-store'

export const runtime = 'nodejs'

async function sendEmail(record: { id: string; subject: string; name: string; company?: string | null; email: string; phone?: string | null; country?: string | null; quantity?: string | null; message: string; source?: string | null; locale?: string | null }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@detwilertech.com'
  const to = process.env.SALES_NOTIFY_EMAIL || process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@detwilertech.com'
  if (!key) {
    console.log('[inquiry] no RESEND_API_KEY — skip email, record persisted')
    return
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(key)
    await resend.emails.send({
      from: `Detwiler Tech <${from}>`,
      to,
      subject: `[New Inquiry] ${record.subject}`,
      html: buildEmailHtml(record),
      text: buildEmailText(record),
    })
    console.log('[inquiry] email sent to', to)
  } catch (e) {
    console.error('[inquiry] email failed', e)
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildEmailHtml(r: Record<string, unknown>) {
  const rows: Array<[string, string | null]> = [
    ['Subject', (r.subject as string) ?? null],
    ['From', ((r.name as string) || '') + (r.company ? ` (${r.company})` : '')],
    ['Email', (r.email as string) ?? null],
    ['Phone', (r.phone as string) ?? null],
    ['Country', (r.country as string) ?? null],
    ['Quantity', (r.quantity as string) ?? null],
    ['Locale', (r.locale as string) ?? 'en'],
    ['Source', (r.source as string) ?? 'form'],
  ]
  const rowsHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;background:#f6f8fa;font-weight:600;border:1px solid #e5e7eb">${escapeHtml(
          k,
        )}</td><td style="padding:6px 12px;border:1px solid #e5e7eb">${escapeHtml(v as string)}</td></tr>`,
    )
    .join('')
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="margin:0 0 16px;color:#111">New inquiry from Detwiler Tech website</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rowsHtml}</table>
      <h3 style="margin:24px 0 8px;color:#111">Message</h3>
      <div style="padding:12px;background:#f6f8fa;border-left:4px solid #c41230;white-space:pre-wrap">${escapeHtml(
        (r.message as string) || '',
      )}</div>
      <p style="margin-top:24px;color:#6b7280;font-size:12px">
        Reply directly to <a href="mailto:${escapeHtml((r.email as string) || '')}">${escapeHtml((r.email as string) || '')}</a>.
      </p>
    </div>
  `
}

function buildEmailText(r: Record<string, unknown>) {
  return [
    `Subject: ${r.subject}`,
    `From: ${r.name}${r.company ? ` (${r.company})` : ''}`,
    `Email: ${r.email}`,
    r.phone ? `Phone: ${r.phone}` : '',
    r.country ? `Country: ${r.country}` : '',
    r.quantity ? `Quantity: ${r.quantity}` : '',
    `Locale: ${r.locale ?? 'en'}`,
    `Source: ${r.source ?? 'form'}`,
    '',
    'Message:',
    r.message,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<InquiryInput>

    // 注入 IP / UA
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      ''
    const ua = req.headers.get('user-agent') || ''

    const merged: InquiryInput = {
      name: body.name ?? '',
      company: body.company,
      email: body.email ?? '',
      phone: body.phone,
      country: body.country,
      quantity: body.quantity,
      message: body.message ?? '',
      product: body.product,
      productName: body.productName,
      source: body.source ?? 'form',
      locale: body.locale,
      ip,
      userAgent: ua,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
    }

    const err = validateInquiry(merged)
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 })
    }

    // 使用 Payload local API 写入数据库（兼容 Vercel serverless）
    const subject = merged.productName
      ? `Inquiry about ${merged.productName}${merged.quantity ? ` (${merged.quantity})` : ''}`
      : `Website inquiry from ${merged.name}`

    // 构建 tracking 信息
    const tracking = {
      ip: merged.ip || undefined,
      userAgent: merged.userAgent || undefined,
      utmSource: merged.utmSource || undefined,
      utmMedium: merged.utmMedium || undefined,
      utmCampaign: merged.utmCampaign || undefined,
    }

    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'inquiries',
      data: {
        subject,
        name: merged.name.trim(),
        company: merged.company?.trim() || undefined,
        email: merged.email.trim().toLowerCase(),
        phone: merged.phone?.trim() || undefined,
        country: merged.country?.trim() || undefined,
        quantity: merged.quantity?.trim() || undefined,
        message: merged.message.trim(),
        source: merged.source ?? 'form',
        status: 'new',
        locale: merged.locale ?? 'en',
        tracking,
        _status: 'published',
      },
    })

    // 异步发邮件（失败不影响写入）
    void sendEmail({
      id: String(doc.id),
      subject,
      name: merged.name.trim(),
      company: merged.company?.trim() || null,
      email: merged.email.trim().toLowerCase(),
      phone: merged.phone?.trim() || null,
      country: merged.country?.trim() || null,
      quantity: merged.quantity?.trim() || null,
      message: merged.message.trim(),
      source: merged.source ?? 'form',
      locale: merged.locale ?? 'en',
    }).catch((e) => console.error('[inquiry] send email', e))

    return NextResponse.json({ ok: true, id: doc.id, createdAt: doc.createdAt })
  } catch (e) {
    console.error('[inquiry] POST error', e)
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST to submit an inquiry' })
}
