import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { clientEnv } from '@/lib/env'

export function Footer() {
  const tFooter = useTranslations('footer')

  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* 菜单列 */}
          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-80">
              {tFooter('support')}
            </h3>
            <ul className="space-y-2 text-sm opacity-60">
              <li>
                <a href="https://www.17track.net/en" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                  {tFooter('trackingOrder')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  {tFooter('refundPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  {tFooter('shippingPolicy')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-80">
              {tFooter('company')}
            </h3>
            <ul className="space-y-2 text-sm opacity-60">
              <li><Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-80">
              {tFooter('products')}
            </h3>
            <ul className="space-y-2 text-sm opacity-60">
              <li><Link href="/products" className="hover:opacity-100 transition-opacity">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-80">
              {tFooter('contact')}
            </h3>
            <ul className="space-y-2 text-sm opacity-60">
              <li>{clientEnv.salesEmail}</li>
              <li>{clientEnv.phone}</li>
              <li>{clientEnv.address}</li>
            </ul>
          </div>
        </div>

        {/* 底栏 */}
        <div className="mt-12 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm opacity-50">
          <div>
            © {year} {clientEnv.siteName}. {tFooter('rights')}
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">{tFooter('privacy')}</a>
            <a href="#" className="hover:opacity-100 transition-opacity">{tFooter('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
