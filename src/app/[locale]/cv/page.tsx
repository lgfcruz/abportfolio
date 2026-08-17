import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { site, about, taxonomy, text, pickList } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cv' });
  return pageMetadata({
    locale,
    pathname: '/cv',
    title: t('title'),
    description: t('intro'),
    ogImage: { ...site.seo.defaultOgImage, alt: t('title') },
  });
}

/**
 * O CV como pagina HTML (indexavel e acessivel) mais o PDF como download.
 * Um CV que existe apenas em PDF e invisivel ao Google e hostil a leitores de ecra.
 */
export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cv');
  const ta = await getTranslations('about');
  const tc = await getTranslations('contact');
  const bio = pickList(about.bio, locale);
  const primary = about.skills.find((s) => s.tier === 'primary');

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-(--color-fg-2)">{t('intro')}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={site.cv[locale].url}
          className="inline-flex min-h-12 items-center rounded-full bg-(--color-accent) px-6 font-medium text-(--color-accent-on)"
        >
          {locale === 'pt' ? t('downloadPt') : t('downloadEn')}
        </a>
        <a
          href={site.cv[locale === 'pt' ? 'en' : 'pt'].url}
          className="inline-flex min-h-12 items-center rounded-full border border-(--color-border-strong) px-6 text-sm"
        >
          {locale === 'pt' ? t('downloadEn') : t('downloadPt')}
        </a>
      </div>
      <p className="meta mt-3">
        {t('updated', { date: site.cv[locale].updated })} · PDF, {site.cv[locale].sizeKb} KB
      </p>

      <div className="mt-16 space-y-14 border-t border-(--color-border) pt-12">
        <section>
          <h2 className="text-2xl">{site.author.name}</h2>
          <p className="mt-1 text-(--color-accent)">{text(site.author.jobTitle, locale)}</p>
          <dl className="mt-5 grid max-w-xl gap-2 font-mono text-xs">
            <Row label={tc('email')} value={site.author.email} href={`mailto:${site.author.email}`} />
            <Row label={tc('phone')} value={site.author.phoneDisplay} href={`tel:${site.author.phone}`} />
            <Row label={tc('location')} value={text(site.author.location, locale)} />
          </dl>
          {bio ? <p className="mt-6 max-w-prose text-(--color-fg-2)">{bio.value[0]}</p> : null}
        </section>

        <section>
          <h2 className="text-2xl">{ta('skills')}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {primary?.groups.map((g) => (
              <div key={text(g.label, locale)}>
                <h3 className="text-base">{text(g.label, locale)}</h3>
                <ul className="mt-2 space-y-1 text-sm text-(--color-fg-2)">
                  {g.items.map((i) => (
                    <li key={text(i, locale)}>{text(i, locale)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl">{ta('tools')}</h2>
          <p className="mt-4 text-(--color-fg-2)">
            {about.tools
              .filter((tool) => tool.level)
              .map((tool) => taxonomy.software.find((s) => s.slug === tool.software)?.label ?? tool.software)
              .join(' · ')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl">{ta('education')}</h2>
          <ul className="mt-6 space-y-5">
            {site.education.map((e) => (
              <li key={`${e.institution}-${e.start}`}>
                <p className="meta">
                  {e.start}–{e.current ? ta('present') : e.end}
                </p>
                <h3 className="mt-1 text-base">{text(e.degree, locale)}</h3>
                <p className="text-sm text-(--color-fg-2)">
                  {e.institution} · {text(e.location, locale)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl">{ta('languages')}</h2>
          <ul className="mt-6 max-w-xs space-y-2">
            {site.author.languages.map((l) => (
              <li key={l.code} className="flex justify-between gap-4 border-b border-(--color-border) pb-2 text-sm">
                <span>{text(l.name, locale)}</span>
                <span className="font-mono text-xs text-(--color-fg-muted)">{text(l.level, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-(--color-border) pb-1.5">
      <dt className="text-(--color-fg-muted) uppercase">{label}</dt>
      <dd className="text-right">
        {href ? (
          <a href={href} className="link-target text-(--color-accent) underline underline-offset-4">
            {value}
          </a>
        ) : (
          <span className="text-(--color-fg-2)">{value}</span>
        )}
      </dd>
    </div>
  );
}
