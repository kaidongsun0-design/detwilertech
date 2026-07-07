import type { CollectionConfig } from 'payload'
import { authenticated, anyone } from '../access'

/**
 * Inquiries — 客户询盘记录
 *
 * 数据源:
 *   - 公开表单 /api/inquiries 提交(走本地 data/inquiries.json 兜底,生产期可切到这里)
 *   - 直接在后台手动录入
 *
 * 权限:
 *   - create: anyone (公开表单)
 *   - read/update/delete: authenticated
 *   - 销售(sales 角色)只能看到自己负责国家/区域的询盘 — Phase 2 接入
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: [
      'subject',
      'name',
      'company',
      'country',
      'source',
      'status',
      'createdAt',
    ],
    group: 'Sales',
    listSearchableFields: ['name', 'email', 'company', 'country', 'subject', 'message'],
    pagination: { defaultLimit: 25, limits: [10, 25, 50, 100] },
  },
  access: {
    create: anyone,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: '询盘主题(自动生成: Inquiry about [product])',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: '关联的产品(可空 — 用于通用联系页)',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'company', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
        { name: 'phone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', admin: { width: '50%' } },
        { name: 'quantity', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'form',
      options: [
        { label: 'Web Form', value: 'form' },
        { label: 'Email Link', value: 'email' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Contact Page', value: 'contact-page' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: '🆕 New', value: 'new' },
        { label: '⏳ In Progress', value: 'in_progress' },
        { label: '✅ Replied', value: 'replied' },
        { label: '🤝 Closed (Deal)', value: 'closed' },
        { label: '❌ Closed (Lost)', value: 'lost' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: '内部备注(仅管理员可见)',
        position: 'sidebar',
      },
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: '中文', value: 'zh' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tracking',
      type: 'group',
      label: 'Tracking',
      admin: {
        description: '追踪信息(自动)',
        position: 'sidebar',
      },
      fields: [
        { name: 'ip', type: 'text', admin: { description: '访客 IP' } },
        { name: 'userAgent', type: 'text', admin: { description: '浏览器 UA' } },
        {
          type: 'row',
          fields: [
            { name: 'utmSource', type: 'text', admin: { width: '33%' } },
            { name: 'utmMedium', type: 'text', admin: { width: '33%' } },
            { name: 'utmCampaign', type: 'text', admin: { width: '34%' } },
          ],
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data }) => {
        // 自动填充 subject (如果没有)
        if (!data.subject && data.name) {
          const productName = data.productName || data.product?.name?.en
          data.subject = productName
            ? `Inquiry about ${productName}${data.quantity ? ` (${data.quantity})` : ''}`
            : `Website inquiry from ${data.name}`
        }
        return data
      },
    ],
  },
}
