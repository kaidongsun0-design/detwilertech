'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

/**
 * ContactForm — 匹配参考站 "Contact us（Get Quato）" 区域
 */
export function ContactForm() {
  const t = useTranslations('home')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    // 模拟发送
    setTimeout(() => {
      setStatus('sent')
    }, 1000)
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
            <p className="text-lg font-medium text-gray-800">Thank you! Your message has been sent.</p>
            <p className="text-sm text-gray-500 mt-2">We will get back to you within 24 hours.</p>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
                placeholder={t('contactMessage')}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
            >
              {status === 'sending' ? 'Sending...' : t('contactSend')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
