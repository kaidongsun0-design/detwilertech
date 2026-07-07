/**
 * BannerSection — 可复用的全宽横幅图片组件
 * 用于各区域之间的分隔横幅
 */

interface BannerSectionProps {
  src: string
  alt?: string
  aspectW?: number
  aspectH?: number
}

export function BannerSection({
  src,
  alt = 'Banner',
  aspectW = 2155,
  aspectH = 730,
}: BannerSectionProps) {
  return (
    <section className="relative w-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
        style={{ aspectRatio: `${aspectW}/${aspectH}` }}
        loading="lazy"
      />
    </section>
  )
}
