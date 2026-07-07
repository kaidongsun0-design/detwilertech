import type { CollectionConfig } from 'payload'
import {
  authenticated,
  superAdmin,
  selfOrAdmin,
  adminAccess,
  superAdminField,
} from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
    group: 'Admin',
  },
  auth: true,
  access: {
    create: superAdmin,
    read: authenticated,
    update: selfOrAdmin,
    delete: superAdmin,
    admin: adminAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Sales', value: 'sales' },
      ],
      access: {
        // 字段级只能返回 boolean
        update: superAdminField,
      },
    },
  ],
  timestamps: true,
}
