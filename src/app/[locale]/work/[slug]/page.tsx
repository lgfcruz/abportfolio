import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  projects, getProject, getProjectNeighbours, categoryOf, subcategoryLabel,
  roleLabel, softwareLabel, specValue, text, pick, pickBody, isVideo,
  absolute, isoDuration, humanDuration, site,
} from '@/lib/content';
import { locales, type Locale } from '@/i18n/routing';
import { pageMetadata, breadcrumbJsonLd, PERSON_ID } from '@/lib/seo';
import { Picture } from '@/components/media/Picture';
import { MediaBlock } from '@/components/media/MediaBlock';
import { VideoFacade } from '@/components/media/VideoFacade';
import { Lightbox, type LightboxImage } from '@/components/media/Lightbox';
import { JsonLd } from '@/components/ui/JsonLd';
import { Fallback } from '@/components/ui/Fallback';
import { Badge } from '@/components/ui/Badge';
import { BackLink } from '@/components/layout/BackLink';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = text(project.seo.title, locale) || `${project.title} — ${text(project.subtitle, locale)}`;
  const description = text(project.seo.description, locale) || text(project.summary, locale);

  return pageMetadata({
    locale,
    pathname: `/work/${slug}`,
    title,
    description,
    ogType: 'article',
    noindex: project.seo.noindex === true,
    ogImage: project.og
      ? { src: project.og, width: 1200, height: 630, alt: text(project.cover.alt, locale) }
      : { src: project.cover.src, width: project.cover.width, height: project.cover.height, alt: text(project.cover.alt, locale) },
  });
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations('project');
  const tNav = await getTranslations('nav');
  const { prev, next } = getProjectNeighbours(slug);
  const category = categoryOf(project.category);
  const body = pickBody(project.body, locale);
  const summary = pick(project.summary, locale);

  const galleryImages: LightboxImage[] = project.gallery
    .filter((m) => !isVideo(m))
    .map((m) => ({ src: m.src, width: m.width, height: m.height, alt: text(m.alt, locale) }));
  const galleryVideos = project.gallery.filter(isVideo);

  const hero = project.hero ?? project.cover;

  return (
    <div data-surface={project.surface} className="bg-(--surface-bg) text-(--surface-fg)">
      {/* ------------------------------------------------------------ topo */}
      <div className="container-page pt-10">
        <BackLink />
      </div>

      <header className="container-page pt-6 pb-10">
        <p className="meta mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          {category ? <span className="text-(--surface-accent)">{text(category.label, locale)}</span> : null}
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
          {project.institution ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{t('academic')}</span>
            </>
          ) : null}
        </p>
        <h1 className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl">{project.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-(--surface-fg-2)">{text(project.subtitle, locale)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{project.context === 'group' ? t('group') : t('individual')}</Badge>
          {project.subcategories.map((s) => (
            <Badge key={s}>{subcategoryLabel(project.category, s, locale)}</Badge>
          ))}
        </div>
      </header>

      <div className="container-page">
        <Picture
          image={hero}
          locale={locale}
          sizes="(max-width: 1424px) 100vw, 1264px"
          priority
          quality={90}
          className="h-auto w-full"
        />
      </div>

      {/* ------------------------------------------------- overview + meta */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-20">
        <div>
          <h2 className="text-2xl">{t('overview')}</h2>
          {summary ? (
            <Fallback from={summary.from} locale={locale}>
              <p className="mt-4 text-lg text-(--surface-fg-2)">{summary.value}</p>
            </Fallback>
          ) : null}

          {body ? (
            <Fallback from={body.from} locale={locale}>
              <div className="prose-body mt-8">
                {body.value.map((block) => (
                  <div key={block.heading ?? block.text.slice(0, 20)}>
                    {block.heading ? <h3>{block.heading}</h3> : null}
                    <p className="text-(--surface-fg-2)">{block.text}</p>
                  </div>
                ))}
              </div>
            </Fallback>
          ) : null}
        </div>

        {/* Bloco de metadados em mono: credibilidade tecnica sem neon */}
        <aside className="space-y-8 border-t border-(--surface-border) pt-8 md:border-t-0 md:pt-0">
          <MetaList label={t('myRole')} items={project.roles.map((r) => roleLabel(r, locale))} />
          <MetaList label={t('tools')} items={project.software.map(softwareLabel)} />
          <dl className="space-y-4">
            <MetaRow label={t('year')} value={String(project.year)} />
            {project.durationLabel ? <MetaRow label={t('duration')} value={text(project.durationLabel, locale)} /> : null}
            {project.institution ? <MetaRow label={tNav('about')} value={project.institution} /> : null}
          </dl>

          {project.team ? (
            <div>
              <h2 className="meta mb-3">{t('credits')}</h2>
              <p className="text-sm text-(--surface-fg-2)">{text(project.team.myRole, locale)}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {project.team.credits.map((c) => (
                  <li key={c.name} className={c.isMe ? 'text-(--surface-fg)' : 'text-(--surface-fg-2)'}>
                    <span className={c.isMe ? 'text-(--surface-accent)' : ''}>{c.name}</span>
                    {' — '}
                    {text(c.role, locale)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {project.specs.length > 0 ? (
            <div>
              <h2 className="meta mb-3">{t('specs')}</h2>
              <dl className="space-y-2 font-mono text-xs">
                {project.specs.map((s) => (
                  <div key={text(s.label, locale)} className="flex justify-between gap-4 border-b border-(--surface-border) pb-1.5">
                    <dt className="text-(--surface-fg-muted)">{text(s.label, locale)}</dt>
                    <dd className="text-right text-(--surface-fg-2)">{specValue(s.value, locale)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </aside>
      </div>

      {/* ---------------------------------------------------- video final */}
      {project.video && project.poster ? (
        <section className="container-page pb-16">
          <h2 className="mb-6 text-2xl">{t('finalVideo')}</h2>
          <VideoFacade
            provider={project.video.provider}
            id={project.video.id}
            hash={project.video.hash}
            title={text(project.video.title, locale) || project.title}
            duration={project.video.durationSeconds ? humanDuration(project.video.durationSeconds, locale) : undefined}
            poster={{
              src: project.poster.src,
              width: project.poster.width,
              height: project.poster.height,
              alt: text(project.poster.alt, locale),
            }}
            sizes="(max-width: 1424px) 100vw, 1264px"
          />
        </section>
      ) : null}

      {/* --------------------------------------------------------- processo */}
      {project.breakdown.length > 0 ? (
        <section className="container-page border-t border-(--surface-border) py-16">
          <h2 className="mb-12 text-3xl">{t('process')}</h2>
          <ol className="space-y-20">
            {project.breakdown.map((step) => (
              <li key={step.step} data-reveal>
                <p className="meta mb-2">{t('step', { n: String(step.step).padStart(2, '0') })}</p>
                <h3 className="text-xl text-(--surface-accent)">{text(step.label, locale)}</h3>
                {step.note ? (
                  <p className="mt-3 max-w-2xl text-(--surface-fg-2)">{text(step.note, locale)}</p>
                ) : null}
                <div
                  className={`mt-6 grid gap-4 ${step.media.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
                >
                  {step.media.map((m) => (
                    <MediaBlock
                      key={isVideo(m) ? m.id : m.src}
                      media={m}
                      locale={locale}
                      sizes={
                        step.media.length > 1
                          ? '(max-width: 640px) 100vw, (max-width: 1424px) 50vw, 616px'
                          : '(max-width: 1424px) 100vw, 1264px'
                      }
                      priority={false}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* --------------------------------------------------------- galeria */}
      {galleryImages.length > 0 || galleryVideos.length > 0 ? (
        <section className="container-page border-t border-(--surface-border) py-16">
          <h2 className="mb-8 text-3xl">{t('gallery')}</h2>
          {galleryImages.length > 0 ? <Lightbox images={galleryImages} /> : null}
          {galleryVideos.length > 0 ? (
            <div className="mt-4 space-y-4">
              {galleryVideos.map((m) => (
                <MediaBlock key={m.id} media={m} locale={locale} sizes="(max-width: 1424px) 100vw, 1264px" />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ------------------------------------------- downloads + links */}
      {project.downloads.length > 0 || project.links.length > 0 ? (
        <section className="container-page border-t border-(--surface-border) py-16">
          <div className="grid gap-12 md:grid-cols-2">
            {project.downloads.length > 0 ? (
              <div>
                <h2 className="meta mb-4">{t('downloads')}</h2>
                <ul className="space-y-3">
                  {project.downloads.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-target text-(--surface-accent) underline underline-offset-4"
                      >
                        {text(d.label, locale)}
                        {d.sizeMb ? <span className="ml-2 font-mono text-xs text-(--surface-fg-muted)">{d.sizeMb} MB</span> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {project.links.length > 0 ? (
              <div>
                <h2 className="meta mb-4">{t('links')}</h2>
                <ul className="space-y-3">
                  {project.links.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-target text-(--surface-accent) underline underline-offset-4"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ----------------------------------------------------- navegacao */}
      <nav className="container-page flex items-stretch justify-between gap-4 border-t border-(--surface-border) py-12">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="group max-w-[48%]">
            <span className="meta block">← {t('previous')}</span>
            <span className="mt-1 block font-display text-lg group-hover:text-(--surface-accent)">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} className="group max-w-[48%] text-right">
            <span className="meta block">{t('next')} →</span>
            <span className="mt-1 block font-display text-lg group-hover:text-(--surface-accent)">{next.title}</span>
          </Link>
        ) : null}
      </nav>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          '@id': `${absolute(`/${locale}/work/${project.slug}`)}#work`,
          name: project.title,
          headline: text(project.subtitle, locale),
          description: text(project.summary, locale),
          creator: { '@id': PERSON_ID },
          dateCreated: project.date,
          inLanguage: locale === 'pt' ? 'pt-PT' : 'en',
          genre: text(category?.label, locale),
          keywords: [
            ...project.roles.map((r) => roleLabel(r, 'en')),
            ...project.software.map(softwareLabel),
          ].join(', '),
          image: [absolute(project.og ?? project.cover.src)],
          url: absolute(`/${locale}/work/${project.slug}`),
          isPartOf: { '@type': 'CollectionPage', url: absolute(`/${locale}/work`) },
          ...(project.video
            ? {
                video: {
                  '@type': 'VideoObject',
                  name: text(project.video.title, locale) || project.title,
                  description: text(project.summary, locale),
                  thumbnailUrl: [absolute(project.poster?.src ?? project.cover.src)],
                  uploadDate: project.date,
                  ...(project.video.durationSeconds ? { duration: isoDuration(project.video.durationSeconds) } : {}),
                  embedUrl:
                    project.video.provider === 'youtube'
                      ? `https://www.youtube-nocookie.com/embed/${project.video.id}`
                      : `https://player.vimeo.com/video/${project.video.id}`,
                },
              }
            : {}),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: site.author.shortName, path: '/' },
          { name: tNav('work'), path: '/work' },
          { name: project.title, path: `/work/${project.slug}` },
        ])}
      />
    </div>
  );
}

function MetaList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="meta mb-3">{label}</h2>
      <ul className="space-y-1 text-sm text-(--surface-fg-2)">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-(--surface-border) pb-2">
      <dt className="meta">{label}</dt>
      <dd className="text-right text-sm text-(--surface-fg-2)">{value}</dd>
    </div>
  );
}
