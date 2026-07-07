'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Mail, MessageCircle, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { clientEnv } from '@/lib/env'
import type { Product } from '@/lib/products'

interface Props {
  product: Product
}

/**
 * 产品详情页 — 三大询盘入口
 *  1. 立即询盘 → 弹窗表单 → 提交到 /api/inquiries
 *  2. 邮件询盘 → mailto: 预填主题和正文
 *  3. WhatsApp → wa.me 短链,预填文本
 */
export function InquiryActions({ product }: Props) {
  const locale = useLocale() as 'en' | 'zh'
  const [open, setOpen] = useState(false)

  const productName = product.name[locale]
  const sku = product.sku
  const origin = typeof window !== 'undefined' ? window.location.origin : clientEnv.siteUrl
  const productUrl = `${origin}/${locale}/products/${product.slug}`

  // Email 询盘
  const emailSubject = `[Inquiry] ${productName} (SKU: ${sku})`
  const emailBody = `Hello Detwiler Tech,

I am interested in the following product:

Product: ${productName}
SKU: ${sku}
Link: ${productUrl}

Please send me a quotation with:
- FOB price
- MOQ
- Lead time
- Payment terms

Quantity required:
Destination port:
Target delivery date:

Best regards,`
  const mailtoLink = `mailto:${clientEnv.salesEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  // WhatsApp 询盘
  const whatsappText = `Hello Detwiler Tech,

I'm interested in: ${productName}
SKU: ${sku}
${productUrl}

Please share pricing and MOQ. Thank you!`
  const whatsappLink = `https://wa.me/${clientEnv.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`

  return (
    <div className="space-y-4">
      {/* 主 CTA：表单询盘 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full gap-2">
            <FileText className="h-4 w-4" />
            {locale === 'zh' ? '立即询盘（获取报价）' : 'Inquire Now (Get Quote)'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === 'zh' ? '询盘表单' : 'Inquiry Form'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'zh'
                ? `填写以下信息获取「${productName}」的报价,我们将在 24 小时内回复。`
                : `Fill in the form to request a quote for "${productName}". We'll respond within 24 hours.`}
            </DialogDescription>
          </DialogHeader>
          <InquiryForm
            product={sku}
            productName={productName}
            source="form"
            onDone={() => {
              setTimeout(() => setOpen(false), 2200)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 次要 CTA：邮件 + WhatsApp */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild size="lg" variant="outline" className="gap-2">
          <a href={mailtoLink}>
            <Mail className="h-4 w-4" />
            {locale === 'zh' ? '邮件询盘' : 'Email Inquiry'}
          </a>
        </Button>
        <Button asChild size="lg" className="gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}

/* ---------------- 通用询盘表单 (复用于联系页 / 产品页弹窗) ---------------- */

export interface InquiryFormProps {
  product?: string
  productName?: string
  source?: 'form' | 'email' | 'whatsapp' | 'contact-page'
  onDone?: () => void
  /** 提交成功后定制 UI (默认显示对勾 + 文案) */
  successRenderer?: () => React.ReactNode
}

export function InquiryForm({
  product,
  productName,
  source = 'form',
  onDone,
  successRenderer,
}: InquiryFormProps) {
  const locale = useLocale() as 'en' | 'zh'
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<'ok' | 'err' | null>(null)
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setDone(null)
    setErrMsg('')
    const fd = new FormData(e.currentTarget)
    const data = {
      name: String(fd.get('name') || ''),
      company: String(fd.get('company') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      country: String(fd.get('country') || ''),
      quantity: String(fd.get('quantity') || ''),
      message: String(fd.get('message') || ''),
      product,
      productName,
      source,
      locale,
    }
    try {
      const resp = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await resp.json()
      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${resp.status}`)
      }
      setDone('ok')
      onDone?.()
    } catch (e: unknown) {
      setDone('err')
      setErrMsg(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (done === 'ok') {
    return successRenderer ? (
      <>{successRenderer()}</>
    ) : (
      <div className="py-8 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-lg">
          {locale === 'zh' ? '询盘已发送！' : 'Inquiry Sent!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {locale === 'zh'
            ? '我们已收到您的询盘,将在 24 小时内回复。'
            : "We've received your inquiry and will get back to you within 24 hours."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {product && <input type="hidden" name="product" value={product} />}
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="locale" value={locale} />

      {productName && (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">{locale === 'zh' ? '询价产品: ' : 'Product: '}</span>
          <span className="font-medium">{productName}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name">{locale === 'zh' ? '姓名 *' : 'Name *'}</Label>
          <Input id="name" name="name" required placeholder={locale === 'zh' ? '您的姓名' : 'Your name'} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">{locale === 'zh' ? '公司' : 'Company'}</Label>
          <Input id="company" name="company" placeholder={locale === 'zh' ? '公司名称' : 'Company name'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{locale === 'zh' ? '电话 / WhatsApp' : 'Phone / WhatsApp'}</Label>
          <Input id="phone" name="phone" placeholder="+1 234 567 8900" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="country">{locale === 'zh' ? '国家' : 'Country'}</Label>
          <Input id="country" name="country" placeholder={locale === 'zh' ? '国家' : 'Country'} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">{locale === 'zh' ? '预计数量' : 'Quantity'}</Label>
          <Input id="quantity" name="quantity" placeholder={locale === 'zh' ? '如 1000 米' : 'e.g. 1000m'} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{locale === 'zh' ? '需求详情 *' : 'Message *'}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder={locale === 'zh' ? '请描述您的需求...' : 'Tell us about your requirements...'}
        />
      </div>

      {done === 'err' && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {locale === 'zh' ? '提交失败:' : 'Submit failed:'} {errMsg}
        </div>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {locale === 'zh' ? '发送中...' : 'Sending...'}
          </>
        ) : (
          locale === 'zh' ? '发送询盘' : 'Send Inquiry'
        )}
      </Button>
    </form>
  )
}
