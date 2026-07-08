'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations, useLocale } from 'next-intl'

/**
 * ContactForm — 匹配参考站 "Contact us（Get Quato）" 区域
 * 提交到 /api/submit-inquiry → Payload CMS
 */
export function ContactForm() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')

    const fd = new FormData(e.currentTarget)
    const data = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
      message: String(fd.get('message') || ''),
      source: 'contact-page',
      locale,
    }

    try {
      const resp = await fetch('/api/submit-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await resp.json()
      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${resp.status}`)
      }
      setStatus('sent')
    } catch (e: unknown) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : 'Submit failed')
    }
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10" style={{ fontFamily: 'Anton, sans-serif' }}>
          {t('contactTitle')}
        </h2>

        {status === 'sent' ? (
          <div className="text-center py-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-800">
              {locale === 'zh' ? '感谢您的留言！已发送成功。' : 'Thank you! Your message has been sent.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {locale === 'zh' ? '我们将在 24 小时内回复您。' : 'We will get back to you within 24 hours.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('contactName')}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder={t('contactName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('contactEmail')}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="Email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('contactPhone')}
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="Phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('contactMessage')}
              </label>
              <textarea
                name="message"
                rows={6}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                placeholder={t('contactMessage')}
              />
            </div>

            {status === 'error' && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {locale === 'zh' ? '提交失败: ' : 'Submit failed: '}{errMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
            >
              {status === 'sending' ? (locale === 'zh' ? '发送中...' : 'Sending...') : t('contactSend')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
