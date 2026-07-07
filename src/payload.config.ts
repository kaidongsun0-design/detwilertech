import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Inquiries } from './collections/Inquiries'
import { Settings } from './collections/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Detwiler Tech',
    },
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
  }),
  editor: lexicalEditor({}),
  collections: [Users, Media, Categories, Products, Inquiries, Settings],
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-replace-in-production-32chars',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // 注意:Payload 的内置 i18n 与 next-intl 的 UI 文案本地化目前不兼容
  // 字段多语言由 collection 自身的 localized: true 实现,UI 文案交给 next-intl
  // 因此这里不开启 payload 的 i18n 块
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  cors: ['http://localhost:3000', process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  csrf: ['http://localhost:3000', process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
})
