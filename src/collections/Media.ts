import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

/**
 * Media — 产品图片、PDF 规格书、公司证书等
 * 开发期存到 public/media/，生产期切到 S3/OSS
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 200, height: 200, position: 'centre' },
      { name: 'card', width: 400, height: 300, position: 'centre' },
      { name: 'detail', width: 800, height: undefined, position: 'centre' },
      { name: 'hero', width: 1920, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: '图片 alt 文本（SEO 与无障碍）',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
  ],
  timestamps: true,
}
