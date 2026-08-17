import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { showreel, site, text, absolute, isoDuration, humanDuration, timecode } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata, PERSON_ID } from '@/lib/seo';
import { VideoFacade } from '@/components/media/VideoFacade';
import { JsonLd } from '@/components/ui/JsonLd';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    pathname: '/showreel',
    title: text(showreel.title, locale),
    description: text(showreel.summary, locale),
    ogType: 'video.other',
    ogImage: {
      src: showreel.poster.src,
      width: showreel.poster.width,
      height: showreel.poster.height,
      alt: text(showreel.poster.alt, locale),
    },
  });
}

export default async function ShowreelPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('showreel');

  const platform = showreel.primary.provider === 'youtube' ? 'YouTube' : 'Vimeo';
  const watchUrl =
    showreel.primary.provider === 'youtube'
      ? `https://www.youtube.com/watch?v=${showreel.primary.id}`
      : `https://vimeo.com/${showreel.primary.id}`;

  return (
    <div className="container-page py-16 md:py-24">
      <p className="meta mb-4">{showreel.year}</p>
      <h1 className="text-4xl md:text-5xl">{text(showreel.title, locale)}</h1>
      <p className="mt-4 mb-10 max-w-2xl text-lg text-(--color-fg-2)">{text(showreel.summary, locale)}</p>

      <VideoFacade
        provider={showreel.primary.provider}
        id={showreel.primary.id}
        hash={showreel.primary.hash}
        title={text(showreel.title, locale)}
        duration={humanDuration(showreel.durationSeconds, locale)}
        poster={{
          src: showreel.poster.src,
          width: showreel.poster.width,
          height: showreel.poster.height,
          alt: text(showreel.poster.alt, locale),
        }}
        sizes="(max-width: 1440px) 100vw, 1344px"
        priority
      />

      {/* Alternativa textual imediatamente sob o video: cumpre WCAG 1.2.3 e e
          conteudo indexavel e legivel por recrutadores. Dois coelhos. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/showreel/breakdown" className="text-(--color-accent) underline underline-offset-4">
          {t('breakdownLink')}
        </Link>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-(--color-fg-2) underline underline-offset-4">
          {t('watchOn', { platform })}
        </a>
        {showreel.download ? (
          <a
            href={showreel.download.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-(--color-fg-2) underline underline-offset-4"
          >
            {text(showreel.download.label, locale)}
          </a>
        ) : null}
      </div>

      <dl className="mt-10 grid max-w-md gap-3 font-mono text-xs">
        <Row label={t('duration')} value={`${humanDuration(showreel.durationSeconds, locale)} (${timecode(showreel.durationSeconds)})`} />
        <Row label={t('music')} value={`${showreel.music.title} — ${showreel.music.artist}`} />
      </dl>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: `${site.author.shortName} — ${text(showreel.title, locale)}`,
          description: text(showreel.summary, locale),
          thumbnailUrl: [absolute(showreel.poster.src)],
          uploadDate: showreel.date,
          duration: isoDuration(showreel.durationSeconds),
          embedUrl:
            showreel.primary.provider === 'youtube'
              ? `https://www.youtube-nocookie.com/embed/${showreel.primary.id}`
              : `https://player.vimeo.com/video/${showreel.primary.id}`,
          contentUrl: watchUrl,
          inLanguage: locale === 'pt' ? 'pt-PT' : 'en',
          creator: { '@id': PERSON_ID },
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-(--color-border) pb-2">
      <dt className="text-(--color-fg-muted) uppercase">{label}</dt>
      <dd className="text-right text-(--color-fg-2)">{value}</dd>
    </div>
  );
}
