'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  provider: 'youtube' | 'vimeo';
  id: string;
  hash?: string;
  title: string;
  duration?: string;
  poster: { src: string; width: number; height: number; alt: string };
  sizes?: string;
  priority?: boolean;
};

/**
 * Fachada clicavel. Nada de terceiros e carregado antes de um clique:
 * um embed padrao do YouTube pesa ~1,2 MB em 20+ requisicoes sem interacao.
 * Isto tambem e conformidade RGPD — nenhum cookie de terceiros sem acto
 * afirmativo do utilizador. Usa youtube-nocookie e Vimeo com dnt=1.
 */
export function VideoFacade({
  provider,
  id,
  hash,
  title,
  duration,
  poster,
  sizes = '100vw',
  priority = false,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const t = useTranslations('media');

  const src =
    provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${hash ? `&h=${hash}` : ''}`;

  const origin = provider === 'youtube' ? 'https://www.youtube-nocookie.com' : 'https://player.vimeo.com';

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          ref={frame}
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-(--color-surface)">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        // preconnect apenas ao passar o rato / focar, nunca no <head>
        onMouseEnter={() => preconnect(origin)}
        onFocus={() => preconnect(origin)}
        className="group absolute inset-0 h-full w-full cursor-pointer"
      >
        <Image
          src={poster.src}
          width={poster.width}
          height={poster.height}
          alt=""
          sizes={sizes}
          priority={priority}
          quality={75}
          className="h-full w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
        />
        <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
        <span className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--color-accent) transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none md:h-20 md:w-20">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-7 w-7 md:h-8 md:w-8" fill="var(--color-accent-on)">
            <path d="M8 5.14v13.72L19 12 8 5.14Z" />
          </svg>
        </span>
        <span className="sr-only">
          {duration ? t('playVideoDuration', { title, duration }) : t('playVideo', { title })}
        </span>
        {duration ? (
          <span className="meta absolute right-3 bottom-3 rounded bg-black/70 px-2 py-1 text-(--color-fg)" aria-hidden="true">
            {duration}
          </span>
        ) : null}
      </button>
    </div>
  );
}

const connected = new Set<string>();
function preconnect(origin: string) {
  if (connected.has(origin)) return;
  connected.add(origin);
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  document.head.appendChild(link);
}
