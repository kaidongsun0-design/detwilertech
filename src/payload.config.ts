import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
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
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        'postgres://localhost:5432/detwilertech',
    },
  }),
  editor: lexicalEditor({}),
  collections: [Users, Media, Categories, Products, Inquiries, Settings],
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-replace-in-production-32chars',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  cors: ['http://localhost:3000', process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  csrf: ['http://localhost:3000', process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
})
