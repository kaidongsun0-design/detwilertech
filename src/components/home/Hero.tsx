'use client'

/**
 * Hero — 全宽横幅轮播，匹配 detwilertech.com 首页 slideshow
 * 不显示 logo，仅纯图像轮播
 */

const BANNERS = [
  {
    src: 'https://img-va.myshopline.com/image/store/1781584901431/DETWILER-TECH-baner1.png?w=1512&h=442',
    alt: 'Detwiler Tech Banner 1',
    aspectW: 1512,
    aspectH: 442,
  },
]

export function Hero() {
  return (
    <section className="relative w-full">
      {BANNERS.map((banner, i) => (
        <div key={i} className="w-full">
          <img
            src={banner.src}
            alt={banner.alt}
            className="w-full h-auto object-cover"
            style={{ aspectRatio: `${banner.aspectW}/${banner.aspectH}` }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </section>
  )
}
