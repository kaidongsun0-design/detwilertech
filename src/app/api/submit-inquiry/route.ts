/**
 * 询盘提交代理 API
 *
 * POST /api/submit-inquiry
 *
 * 代理转发到 Payload REST API (/api/inquiries)。
 * 处理 CSRF token 和邮件通知。
 * 这样做的原因是我们的自定义 /api/inquiries route 会 shadow Payload 自己的 REST API。
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateInquiry, type InquiryInput } from '@/lib/inquiry-store'

export const runtime = 'nodejs'

async function sendEmailNotification(record: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log('[inquiry] no RESEND_API_KEY — skip email')
    return
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(key)
    const from = process.env.RESEND_FROM_EMAIL || 'noreply@detwilertech.com'
    const to = process.env.SALES_NOTIFY_EMAIL || process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@detwilertech.com'

    const subject = record.subject || 'Website inquiry'
    const rows = [
      `Subject: ${subject}`,
      `From: ${record.name || ''}${record.company ? ` (${record.company})` : ''}`,
      `Email: ${record.email || ''}`,
      record.phone ? `Phone: ${record.phone}` : '',
      record.country ? `Country: ${record.country}` : '',
      record.quantity ? `Quantity: ${record.quantity}` : '',
    ].filter(Boolean).join('\n')

    await resend.emails.send({
      from: `Detwiler Tech <${from}>`,
      to,
      subject: `[New Inquiry] ${subject}`,
      text: `${rows}\n\nMessage:\n${record.message || ''}\n\n---\nReply to: ${record.email || ''}`,
    })
    console.log('[inquiry] email sent to', to)
  } catch (e) {
    console.error('[inquiry] email failed', e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<InquiryInput>

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
    }

    const err = validateInquiry(merged)
    if (err) {
      return NextResponse.json({ ok: false, error: err }, { status: 400 })
    }

    const subject = merged.productName
      ? `Inquiry about ${merged.productName}${merged.quantity ? ` (${merged.quantity})` : ''}`
      : `Website inquiry from ${merged.name}`

    // 获取 Payload CSRF token
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

    // 从浏览器请求中提取 cookie 并转发
    const csrfCookie = req.cookies.get('payload-token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (csrfCookie) {
      headers['X-CSRF-Token'] = csrfCookie.value
    }

    // 转发到 Payload REST API
    const payloadResp = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
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
        _status: 'published',
      }),
    })

    const result = await payloadResp.json()

    if (!payloadResp.ok) {
      console.error('[inquiry] Payload API error', result)
      return NextResponse.json({ ok: false, error: result.errors?.[0]?.message || 'Failed to save inquiry' }, { status: 500 })
    }

    // 异步发邮件
    void sendEmailNotification({
      id: result.doc?.id,
      subject,
      name: merged.name.trim(),
      company: merged.company?.trim() || null,
      email: merged.email.trim(),
      phone: merged.phone?.trim() || null,
      country: merged.country?.trim() || null,
      quantity: merged.quantity?.trim() || null,
      message: merged.message.trim(),
    }).catch(console.error)

    return NextResponse.json({ ok: true, id: result.doc?.id, createdAt: result.doc?.createdAt })
  } catch (e) {
    console.error('[inquiry] POST error', e)
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST to submit an inquiry' })
}
