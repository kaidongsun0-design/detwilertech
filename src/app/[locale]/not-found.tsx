import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-24 md:py-32">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted-foreground">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">
              <Search className="h-4 w-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
