import { useTranslations } from 'next-intl'
import { getActivePaymentMethods, paymentMethods } from '@/lib/payment-methods'
import { Banknote, Building2, Send, Wallet, CreditCard, MessageCircle, CircleDollarSign } from 'lucide-react'

const iconMap = {
  Banknote, Building2, Send, Wallet, CreditCard, MessageCircle, CircleDollarSign,
} as const

/**
 * PaymentMethods — 支付方式展示区
 *
 * 当前：仅 Cash on Delivery 启用（绿色高亮 + 可点击）
 * 其他支付方式：灰显 + "Coming Soon" 角标
 *
 * 启用新支付 = 改 paymentMethods[id].enabled = true，无需 UI 改动
 */
export function PaymentMethods() {
  const t = useTranslations('home')
  const tPay = useTranslations('payment')
  const active = getActivePaymentMethods()

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('paymentMethods')}</h2>
          <p className="mt-3 text-muted-foreground">{t('paymentMethodsDesc')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {paymentMethods.map((method) => {
            const Icon = iconMap[method.icon as keyof typeof iconMap] || Banknote
            const isActive = method.enabled
            return (
              <div
                key={method.id}
                className={`
                  relative aspect-square p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                  ${isActive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-dashed border-muted bg-muted/30 text-muted-foreground'
                  }
                `}
              >
                <Icon className={`h-8 w-8 ${isActive ? 'text-brand-600' : 'text-muted-foreground/60'}`} />
                <div className="text-xs font-semibold text-center leading-tight">
                  {tPay(method.labelKey.split('.')[1] as any)}
                </div>
                {!isActive && (
                  <div className="absolute -top-2 -right-2 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium border border-amber-200">
                    {tPay('comingSoon')}
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-2 -right-2 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {active.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            No payment methods configured. Please contact our sales team for terms.
          </p>
        )}
      </div>
    </section>
  )
}
