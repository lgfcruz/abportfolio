import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  site, about, showreel, featuredProjects, activeCategories,
  text, pickList, humanDuration,
} from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/work/ProjectCard';
import { VideoFacade } from '@/components/media/VideoFacade';
import { Picture } from '@/components/media/Picture';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return pageMetadata({
    locale,
    pathname: '/',
    title: `${site.author.shortName} — ${text(site.author.jobTitle, locale)}`,
    description: text(site.author.tagline, locale),
    ogImage: { ...site.seo.defaultOgImage, alt: `${site.author.shortName} — ${t('home')}` },
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tp = await getTranslations('project');
  const ts = await getTranslations('showreel');
  const bio = pickList(about.bio, locale);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="container-page pt-16 pb-10 md:pt-24">
        <p className="meta mb-5 flex flex-wrap items-center gap-3">
          <span>{text(site.author.location, locale)}</span>
          {site.author.availability.open ? (
            <Badge tone="accent">{text(site.author.availability.label, locale)}</Badge>
          ) : null}
        </p>
        <h1 className="max-w-4xl text-4xl leading-[1.02] sm:text-6xl lg:text-7xl">
          {site.author.shortName}
          <span className="mt-3 block text-(--color-fg-2)">{text(site.author.jobTitle, locale)}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-(--color-fg-2)">{text(site.author.tagline, locale)}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/showreel"
            className="inline-flex min-h-12 items-center rounded-full bg-(--color-accent) px-6 font-medium text-(--color-accent-on) transition-transform hover:scale-[1.02] motion-reduce:transform-none"
          >
            {t('watchShowreel')}
          </Link>
          <Link
            href="/work"
            className="inline-flex min-h-12 items-center rounded-full border border-(--color-border-strong) px-6 font-medium text-(--color-fg) transition-colors hover:border-(--color-fg-2)"
          >
            {t('viewWork')}
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------- showreel */}
      <section className="container-page pb-8" data-reveal>
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
          sizes="100vw"
          priority
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="meta">
            {text(showreel.title, locale)} · {humanDuration(showreel.durationSeconds, locale)}
          </p>
          <Link href="/showreel/breakdown" className="text-sm text-(--color-accent) underline underline-offset-4">
            {ts('breakdownLink')}
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------- selected work */}
      <Section id="work">
        <SectionHeading
          eyebrow={t('selectedWork')}
          action={
            <Link href="/work" className="text-sm text-(--color-accent) underline underline-offset-4">
              {t('allWork')}
            </Link>
          }
        >
          {t('selectedWorkIntro')}
        </SectionHeading>

        {/* Ritmo alternado: a primeira peca ocupa a largura toda, as seguintes
            emparelham. O ritmo visual muda ao longo da pagina. */}
        <ul className="space-y-16">
          {featuredProjects.slice(0, 1).map((p) => (
            <li key={p.slug} data-reveal>
              <ProjectCard project={p} locale={locale} sizes="(max-width: 1024px) 100vw, 1200px" large />
            </li>
          ))}
        </ul>

        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
          {featuredProjects.slice(1, 5).map((p) => (
            <li key={p.slug} data-reveal>
              <ProjectCard project={p} locale={locale} sizes="(max-width: 640px) 100vw, 50vw" />
            </li>
          ))}
        </ul>
      </Section>

      {/* ----------------------------------------------------- capabilities */}
      <Section className="border-t border-(--color-border)">
        <SectionHeading eyebrow={t('capabilities')}>{t('capabilities')}</SectionHeading>
        <div className="grid gap-10 md:grid-cols-3">
          {activeCategories().map((c) => (
            <div key={c.slug} data-reveal>
              <h3 className="text-lg text-(--color-accent)">{text(c.label, locale)}</h3>
              <p className="mt-2 text-sm text-(--color-fg-2)">{text(c.description, locale)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- about */}
      <Section className="border-t border-(--color-border)">
        <SectionHeading eyebrow={t('aboutHeading')}>{tp('overview')}</SectionHeading>
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-16">
          <div className="max-w-sm">
            <Picture
              image={site.author.portrait}
              locale={locale}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="h-auto w-full"
            />
          </div>
          <div className="prose-body">
            {bio?.value.slice(0, 2).map((p) => (
              <p key={p.slice(0, 24)} className="text-(--color-fg-2)">
                {p}
              </p>
            ))}
            <Link
              href="/about"
              className="mt-4 inline-block text-sm text-(--color-accent) underline underline-offset-4"
            >
              {t('aboutMore')}
            </Link>
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- contact */}
      <Section className="border-t border-(--color-border)">
        <h2 className="text-3xl md:text-4xl">{t('contactHeading')}</h2>
        <p className="mt-4 max-w-xl text-(--color-fg-2)">
          {text(site.author.availability.detail, locale)}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.author.email}`}
            className="inline-flex min-h-12 items-center rounded-full bg-(--color-accent) px-6 font-medium text-(--color-accent-on)"
          >
            {site.author.email}
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center rounded-full border border-(--color-border-strong) px-6 font-medium"
          >
            {t('contactHeading')}
          </Link>
        </div>
      </Section>
    </>
  );
}
