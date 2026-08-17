import { isVideo, text, humanDuration, type Media } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { Picture } from './Picture';
import { VideoFacade } from './VideoFacade';

/**
 * Recebe `Media` (imagem OU video) e despacha. E o que permite que `gallery` e
 * `breakdown` no JSON aceitem os dois tipos sem nenhum `if` nas paginas.
 */
export function MediaBlock({
  media,
  locale,
  sizes,
  priority = false,
}: {
  media: Media;
  locale: Locale;
  sizes: string;
  priority?: boolean;
}) {
  if (isVideo(media)) {
    const poster = media.poster;
    if (!poster) return null;
    return (
      <VideoFacade
        provider={media.provider}
        id={media.id}
        hash={media.hash}
        title={text(media.title, locale)}
        duration={media.durationSeconds ? humanDuration(media.durationSeconds, locale) : undefined}
        poster={{
          src: poster.src,
          width: poster.width,
          height: poster.height,
          alt: text(poster.alt, locale),
        }}
        sizes={sizes}
        priority={priority}
      />
    );
  }
  return <Picture image={media} locale={locale} sizes={sizes} priority={priority} className="h-auto w-full" />;
}
