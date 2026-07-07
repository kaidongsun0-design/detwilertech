import type { Access, FieldAccess } from 'payload'

// ============================================================
// 集合级 Access（支持返回 Where 子句做行级过滤）
// ============================================================

/** 仅已登录管理员可访问 */
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

/** 仅超级管理员（集合级）*/
export const superAdmin: Access = ({ req: { user } }) => {
  return (user as any)?.roles?.includes('super-admin') || false
}

/** 公开访问 */
export const anyone: Access = () => true

/** 仅本人或超级管理员（集合级 — 支持 Where 过滤）*/
export const selfOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as any).roles?.includes('super-admin')) return true
  // 行级过滤：只允许访问/更新自己
  return { id: { equals: user.id } }
}

// ============================================================
// Admin 集合可见性（严格 boolean-only，不支持 Where）
// ============================================================

/** admin 访问：布尔判断 */
export const adminAccess = ({ req: { user } }: any): boolean => {
  return Boolean(user)
}

/** superAdmin admin 访问：布尔判断 */
export const superAdminAccess = ({ req: { user } }: any): boolean => {
  return (user as any)?.roles?.includes('super-admin') || false
}

// ============================================================
// 字段级 FieldAccess（只允许返回 boolean）
// ============================================================

/** 字段级：仅已登录用户 */
export const authenticatedField: FieldAccess = ({ req: { user } }) => {
  return Boolean(user)
}

/** 字段级：仅超级管理员 */
export const superAdminField: FieldAccess = ({ req: { user } }) => {
  return (user as any)?.roles?.includes('super-admin') || false
}
