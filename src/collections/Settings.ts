import type { CollectionConfig } from 'payload'
import { authenticated, superAdmin } from '../access'

/**
 * Settings — 单例集合
 * 用于存储站点全局配置：WhatsApp 号、销售邮箱、地址、社交链接等
 *
 * 仅 super-admin 可修改；任何人可读。
 */
export const Settings: CollectionConfig = {
  slug: 'settings',
  admin: {
    useAsTitle: 'siteName',
    group: 'Admin',
    description: '站点全局配置（仅一条记录）',
  },
  access: {
    read: () => true,
    create: superAdmin,
    update: superAdmin,
    delete: superAdmin,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Detwiler Tech',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            { name: 'salesEmail', type: 'email', required: true },
            { name: 'infoEmail', type: 'email', required: true },
            { name: 'whatsappNumber', type: 'text', required: true, admin: { description: '国际格式，无 +' } },
            { name: 'phone', type: 'text' },
            { name: 'address', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Branding',
          fields: [
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'favicon', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'linkedin', type: 'text' },
            { name: 'facebook', type: 'text' },
            { name: 'youtube', type: 'text' },
            { name: 'instagram', type: 'text' },
          ],
        },
        {
          label: 'SEO Defaults',
          fields: [
            { name: 'defaultMetaTitle', type: 'text', localized: true },
            { name: 'defaultMetaDescription', type: 'textarea', localized: true },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
