'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { Search, ShoppingCart, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LangSwitcher } from './LangSwitcher'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { key: 'home', href: '/' },
  { key: 'products', href: '/products' },
  { key: 'solutions', href: '/products?category=fiber-optic' },
  { key: 'news', href: '/products?category=patch-panel' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const

export function Header() {
  const t = useTranslations('nav')
  const tHome = useTranslations('home')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b">
      {/* 公告栏 — 匹配参考站 */}
      <div className="bg-red-600 text-white">
        <div className="container flex h-9 items-center justify-center text-sm font-medium">
          {tHome('announcement')}
        </div>
      </div>

      {/* 主导航 */}
      <div className="container flex h-16 items-center justify-between">
        {/* 桌面导航 — 无 Logo */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors relative group',
                  active
                    ? 'text-red-600'
                    : 'text-gray-700 hover:text-red-600',
                )}
              >
                {t(item.key)}
                <span className={cn(
                  'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-red-600 transition-all duration-200',
                  active ? 'w-full' : 'w-0 group-hover:w-full',
                )} />
              </Link>
            )
          })}
        </nav>

        {/* 右侧图标 */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-600">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-600">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-600 relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">0</span>
          </Button>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <LangSwitcher />
        </div>

        {/* 移动端菜单按钮 */}
        <div className="flex lg:hidden items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 text-base font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="my-4 border-t" />
                <div className="px-3">
                  <LangSwitcher />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 移动端导航 — 底部固定 */}
      <nav className="lg:hidden flex items-center justify-between px-4 py-2 border-t bg-white overflow-x-auto">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium whitespace-nowrap rounded transition-colors',
                active
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600',
              )}
            >
              {t(item.key)}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
