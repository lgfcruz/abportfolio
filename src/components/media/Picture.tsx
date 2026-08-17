import Image from 'next/image';
import { text, type MediaImage } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

/**
 * Envolve next/image e resolve o alt bilingue. Nunca renderizar imagens de
 * conteudo com background-image: o alt tem de existir (WCAG 1.1.1).
 */
export function Picture({
  image,
  locale,
  sizes,
  priority = false,
  quality = 75,
  className = '',
  decorative = false,
}: {
  image: MediaImage;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src={image.src}
      width={image.width}
      height={image.height}
      alt={decorative ? '' : text(image.alt, locale)}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
