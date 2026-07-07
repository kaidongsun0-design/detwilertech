import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Products — 产品核心集合
 *
 * 多语言策略：
 *   - Payload 字段 localized: true (产品名、描述、规格) — 存到不同字段，REST/GraphQL 返回多语言版本
 *   - 配合 next-intl 处理 UI 文案（按钮、菜单等）
 *   - 前端根据当前 locale 选择对应字段渲染
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name.en', 'sku', 'category', 'featured', 'updatedAt'],
    group: 'Products',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: '产品型号 / SKU（用于询盘邮件主题与 WhatsApp 预填文本）',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL 友好的英文标识',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      hasMany: false,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      admin: {
        description: '列表页与卡片展示的简短描述',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'specifications',
      type: 'array',
      localized: true,
      admin: {
        description: '规格参数表（键值对列表）',
      },
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'isPrimary', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'datasheet',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '产品 PDF 规格书',
      },
    },
    {
      name: 'moq',
      type: 'text',
      localized: true,
      admin: {
        description: 'Minimum Order Quantity（最小起订量）',
      },
    },
    {
      name: 'leadTime',
      type: 'text',
      localized: true,
      admin: {
        description: '交货期，如 15-25 days',
      },
    },
    {
      name: 'origin',
      type: 'text',
      localized: true,
      admin: {
        description: '产地',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: '是否在首页核心产品区展示',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: '排序权重（数字小的在前）',
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
  timestamps: true,
}
