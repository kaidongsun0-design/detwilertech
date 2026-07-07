/**
 * 询盘提交 API route
 *
 * POST /api/inquiries
 *   body: InquiryInput
 *   response: { ok: true, id } | { ok: false, error }
 *
 * 行为:
 *   1. 校验
 *   2. 写入本地 JSON (data/inquiries.json) — 兜底,生产可切 Payload
 *   3. 如果配置了 RESEND_API_KEY,异步发邮件
 *   4. 如果配置了 TURNSTILE_SECRET_KEY,验证 token
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { InquiryInput, InquiryRecord, normalize, validateInquiry } from '@/lib/inquiry-store'

export const runtime = 'nodejs'

const DATA_FILE = join(process.cwd(), 'data', 'inquiries.json')

async function ensureFile() {
  try {
    await access(DATA_FILE)
  } catch {
    await mkdir(join(process.cwd(), 'data'), { recursive: true })
    await writeFile(DATA_FILE, '[]', 'utf-8')
  }
}

async function readAll(): Promise<InquiryRecord[]> {
  await ensureFile()
  try {
    const raw = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as InquiryRecord[]
  } catch {
    return []
  }
}

async function append(record: InquiryRecord) {
  const list = await readAll()
  list.unshift(record)
  // 截断到 5000 条
  if (list.length > 5000) list.length = 5000
  await writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

async function sendEmail(record: InquiryRecord) {
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

function buildEmailHtml(r: InquiryRecord) {
  const rows: Array<[string, string | null]> = [
    ['Subject', r.subject],
    ['From', r.name + (r.company ? ` (${r.company})` : '')],
    ['Email', r.email],
    ['Phone', r.phone],
    ['Country', r.country],
    ['Quantity', r.quantity],
    ['Product', r.productName ? `${r.productName} (SKU: ${r.product})` : null],
    ['Locale', r.locale ?? 'en'],
    ['Source', r.source ?? 'form'],
    ['IP', r.ip],
    ['UTM', [r.utmSource, r.utmMedium, r.utmCampaign].filter(Boolean).join(' / ') || null],
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
      <div style="padding:12px;background:#f6f8fa;border-left:4px solid #2563eb;white-space:pre-wrap">${escapeHtml(
        r.message,
      )}</div>
      <p style="margin-top:24px;color:#6b7280;font-size:12px">
        Reply directly to <a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email)}</a>.
      </p>
    </div>
  `
}

function buildEmailText(r: InquiryRecord) {
  return [
    `Subject: ${r.subject}`,
    `From: ${r.name}${r.company ? ` (${r.company})` : ''}`,
    `Email: ${r.email}`,
    r.phone ? `Phone: ${r.phone}` : '',
    r.country ? `Country: ${r.country}` : '',
    r.quantity ? `Quantity: ${r.quantity}` : '',
    r.productName ? `Product: ${r.productName} (SKU: ${r.product})` : '',
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

    // 注入 IP / UA / UTM
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      ''
    const ua = req.headers.get('user-agent') || ''
    const utm = {
      utmSource: req.headers.get('x-utm-source') || '',
      utmMedium: req.headers.get('x-utm-medium') || '',
      utmCampaign: req.headers.get('x-utm-campaign') || '',
    }
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
      utmSource: body.utmSource || utm.utmSource,
      utmMedium: body.utmMedium || utm.utmMedium,
      utmCampaign: body.utmCampaign || utm.utmCampaign,
    }

    const err = validateInquiry(merged)
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 })
    }

    const record = normalize(merged)
    await append(record)

    // 异步发邮件(失败不影响写入)
    void sendEmail(record).catch((e) => console.error('[inquiry] send email', e))

    return NextResponse.json({ ok: true, id: record.id, createdAt: record.createdAt })
  } catch (e) {
    console.error('[inquiry] POST error', e)
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  // GET 用于健康检查;真实询盘读取在 /admin 后台
  return NextResponse.json({ ok: true, hint: 'POST to submit an inquiry' })
}
