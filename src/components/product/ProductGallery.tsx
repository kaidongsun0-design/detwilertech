'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const total = images.length

  if (total === 0) {
    return (
      <div className="aspect-square rounded-2xl border bg-muted flex items-center justify-center text-muted-foreground">
        No Image
      </div>
    )
  }

  const current = images[active]
  const prev = () => setActive((i) => (i - 1 + total) % total)
  const next = () => setActive((i) => (i + 1) % total)

  return (
    <div className="space-y-3">
      {/* 主图区 */}
      <div
        className={cn(
          'relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 border',
          zoomed && 'cursor-zoom-out',
        )}
        onClick={() => setZoomed((z) => !z)}
      >
        <img
          src={current}
          alt={name}
          className={cn(
            'w-full h-full object-contain transition-transform duration-300',
            zoomed && 'scale-150',
          )}
        />

        {/* 左右切换 */}
        {total > 1 && !zoomed && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center hover:bg-white transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center hover:bg-white transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* 放大按钮 */}
        {!zoomed && (
          <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center pointer-events-none">
            <ZoomIn className="h-4 w-4" />
          </div>
        )}

        {/* 计数 */}
        {total > 1 && (
          <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/60 text-white px-2 py-0.5 rounded">
            {active + 1} / {total}
          </div>
        )}
      </div>

      {/* 缩略图 */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'aspect-square rounded-lg overflow-hidden border-2 transition',
                i === active
                  ? 'border-brand-500 ring-2 ring-brand-200'
                  : 'border-transparent hover:border-muted-foreground/30',
              )}
            >
              <img
                src={src}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
