import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class 合并工具（shadcn 标准） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化日期 */
export function formatDate(
  date: Date | string,
  locale: string = 'en',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', options).format(d)
}

/** 安全地从对象中读取一个本地化字段 */
export function localized<T>(
  obj: { en?: T; zh?: T } | T | undefined | null,
  locale: 'en' | 'zh',
): T | undefined {
  if (!obj) return undefined
  if (typeof obj === 'object' && obj !== null && ('en' in obj || 'zh' in obj)) {
    const loc = obj as { en?: T; zh?: T }
    return loc[locale] ?? loc.en ?? loc.zh
  }
  return obj as T
}

/** URL 安全化（生成 slug） */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** 去除 HTML 标签，提取纯文本 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
