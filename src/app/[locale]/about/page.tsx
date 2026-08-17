import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { about, site, taxonomy, text, pickList, absolute } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata, personJsonLd } from '@/lib/seo';
import { Picture } from '@/components/media/Picture';
import { Badge } from '@/components/ui/Badge';
import { JsonLd } from '@/components/ui/JsonLd';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return pageMetadata({
    locale,
    pathname: '/about',
    title: t('title'),
    description: text(site.author.tagline, locale),
    ogImage: {
      src: site.author.portrait.src,
      width: site.author.portrait.width,
      height: site.author.portrait.height,
      alt: text(site.author.portrait.alt, locale),
    },
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const bio = pickList(about.bio, locale);

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl">{site.author.name}</h1>
      <p className="mt-3 text-lg text-(--color-accent)">{text(site.author.jobTitle, locale)}</p>
      <p className="meta mt-2">{text(site.author.location, locale)}</p>

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-20">
        <div className="max-w-sm">
          <Picture
            image={site.author.portrait}
            locale={locale}
            sizes="(max-width: 768px) 100vw, 384px"
            priority
            className="h-auto w-full"
          />
          <a
            href={site.cv[locale].url}
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-(--color-accent) px-6 font-medium text-(--color-accent-on)"
          >
            {t('downloadCv')}
          </a>
        </div>

        <div className="prose-body">
          {bio?.value.map((p) => (
            <p key={p.slice(0, 24)} className="text-(--color-fg-2)">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Competencias agrupadas por nivel, sem barras de percentagem —
          barras sao subjetivas e nao provam nada. */}
      <section className="mt-24 border-t border-(--color-border) pt-12">
        <h2 className="text-3xl">{t('skills')}</h2>
        <div className="mt-10 space-y-12">
          {about.skills.map((tier) => (
            <div key={tier.tier}>
              <p className="meta mb-5 text-(--color-accent)">{text(tier.label, locale)}</p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {tier.groups.map((g) => (
                  <div key={text(g.label, locale)}>
                    <h3 className="text-base">{text(g.label, locale)}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-(--color-fg-2)">
                      {g.items.map((it) => (
                        <li key={text(it, locale)}>{text(it, locale)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-(--color-border) pt-12">
        <h2 className="text-3xl">{t('tools')}</h2>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {about.tools.map((tool) => {
            const sw = taxonomy.software.find((s) => s.slug === tool.software);
            return (
              <li key={tool.software} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-(--color-border) pb-2">
                <span className="text-sm">{sw?.label ?? tool.software}</span>
                {/* Nivel so aparece quando existe. Nunca publicar "iniciante". */}
                {tool.level ? (
                  <span className="font-mono text-xs text-(--color-fg-muted)">{text(tool.level, locale)}</span>
                ) : (
                  <Badge>{t('exploringShort')}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-20 grid gap-16 border-t border-(--color-border) pt-12 md:grid-cols-2">
        <section>
          <h2 className="text-3xl">{t('education')}</h2>
          <ul className="mt-8 space-y-6">
            {site.education.map((e) => (
              <li key={`${e.institution}-${e.start}`}>
                <p className="meta">
                  {e.start}–{e.current ? t('present') : e.end}
                </p>
                <h3 className="mt-1 text-base">{text(e.degree, locale)}</h3>
                <p className="text-sm text-(--color-fg-2)">
                  {e.institution} · {text(e.location, locale)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-16">
          <section>
            <h2 className="text-3xl">{t('languages')}</h2>
            <ul className="mt-8 space-y-2">
              {site.author.languages.map((l) => (
                <li key={l.code} className="flex justify-between gap-4 border-b border-(--color-border) pb-2 text-sm">
                  <span>{text(l.name, locale)}</span>
                  <span className="font-mono text-xs text-(--color-fg-muted)">{text(l.level, locale)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-3xl">{t('strengths')}</h2>
            <ul className="mt-8 space-y-1.5 text-sm text-(--color-fg-2)">
              {about.strengths.map((s) => (
                <li key={text(s, locale)}>{text(s, locale)}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': `${absolute(`/${locale}/about`)}#profilepage`,
          url: absolute(`/${locale}/about`),
          inLanguage: locale === 'pt' ? 'pt-PT' : 'en',
          name: `${site.author.shortName} — ${t('title')}`,
          mainEntity: personJsonLd(locale),
        }}
      />
    </div>
  );
}
