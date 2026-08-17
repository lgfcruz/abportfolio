import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { showreel, getProject, roleLabel, text, timecode, site } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'showreel' });
  return pageMetadata({
    locale,
    pathname: '/showreel/breakdown',
    title: t('breakdownTitle'),
    description: t('breakdownIntro'),
    ogImage: { ...site.seo.defaultOgImage, alt: t('breakdownTitle') },
  });
}

export default async function BreakdownPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('showreel');

  return (
    <div className="container-page py-16 md:py-24">
      <Link href="/showreel" className="meta link-target">
        ← {t('title')}
      </Link>
      <h1 className="mt-4 text-4xl md:text-5xl">{t('breakdownTitle')}</h1>
      <p className="mt-4 mb-12 max-w-2xl text-lg text-(--color-fg-2)">{t('breakdownIntro')}</p>

      <ol className="space-y-6">
        {showreel.shots.map((shot, i) => {
          const project = shot.project ? getProject(shot.project) : undefined;
          return (
            <li key={`${shot.at}-${i}`} className="border-b border-(--color-border) pb-6">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="meta w-16 shrink-0 text-(--color-accent)">{timecode(shot.at)}</p>
                <h2 className="font-display text-lg">{text(shot.label, locale)}</h2>
              </div>
              <div className="mt-2 ml-0 flex flex-wrap gap-x-4 gap-y-1 pl-0 text-sm text-(--color-fg-2) sm:ml-20">
                {shot.roles.length > 0 ? (
                  <p>{shot.roles.map((r) => roleLabel(r, locale)).join(' · ')}</p>
                ) : null}
                {project ? (
                  <Link href={`/work/${project.slug}`} className="link-target text-(--color-accent) underline underline-offset-4">
                    {project.title}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
