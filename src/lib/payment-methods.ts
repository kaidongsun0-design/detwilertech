/**
 * 支付方式配置 — 预留插槽模式
 *
 * 当前 Phase 1-4：仅 COD (Cash on Delivery) 启用为展示项
 * 后期 Phase 5：将对应 provider 的 enabled 改为 true 并实现具体集成
 *
 * 启用支付 = ① 改 enabled: true ② 实现对应 provider 文件（src/lib/mail/<provider>.ts）
 * 无需修改 UI、组件或数据模型 — 真正的"插槽"模式。
 */

export type PaymentProvider =
  | 'cod'      // 货到付款 — 当前唯一激活
  | 'tt'       // T/T 电汇
  | 'wu'       // 西联汇款
  | 'paypal'   // PayPal (后期)
  | 'stripe'   // Stripe 信用卡 (后期)
  | 'alipay'   // 支付宝 (后期)
  | 'wechat'   // 微信支付 (后期)

export interface PaymentMethod {
  /** 唯一 ID */
  id: PaymentProvider
  /** 是否启用（控制显示与激活流程）*/
  enabled: boolean
  /** i18n key（对应 src/i18n/messages/{en,zh}.json 中的 payment.*）*/
  labelKey: string
  /** 简单 lucide-react 图标名（客户端组件使用）*/
  icon: string
  /** 备注/说明（Tooltip 使用）*/
  note?: string
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    enabled: true,   // ✅ 当前唯一激活
    labelKey: 'payment.cod',
    icon: 'Banknote',
    note: 'Cash on Delivery available for select regions',
  },
  {
    id: 'tt',
    enabled: false,
    labelKey: 'payment.tt',
    icon: 'Building2',
  },
  {
    id: 'wu',
    enabled: false,
    labelKey: 'payment.wu',
    icon: 'Send',
  },
  {
    id: 'paypal',
    enabled: false,
    labelKey: 'payment.paypal',
    icon: 'Wallet',
  },
  {
    id: 'stripe',
    enabled: false,
    labelKey: 'payment.stripe',
    icon: 'CreditCard',
  },
  {
    id: 'alipay',
    enabled: false,
    labelKey: 'payment.alipay',
    icon: 'CircleDollarSign',
  },
  {
    id: 'wechat',
    enabled: false,
    labelKey: 'payment.wechat',
    icon: 'MessageCircle',
  },
]

/** 仅获取当前启用的支付方式（用于 UI 展示）*/
export function getActivePaymentMethods(): PaymentMethod[] {
  return paymentMethods.filter((m) => m.enabled)
}

/** 是否至少有一种支付方式启用 */
export function hasActivePaymentMethod(): boolean {
  return paymentMethods.some((m) => m.enabled)
}
