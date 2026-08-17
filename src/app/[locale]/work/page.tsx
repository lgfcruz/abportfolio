import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { projects, activeCategories, text, site } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { ProjectCard } from '@/components/work/ProjectCard';
import { WorkGrid } from '@/components/work/WorkGrid';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  return pageMetadata({
    locale,
    pathname: '/work',
    title: t('title'),
    description: t('intro'),
    ogImage: { ...site.seo.defaultOgImage, alt: t('title') },
  });
}

export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('work');

  const options = activeCategories().map((c) => ({ slug: c.slug, label: text(c.short, locale) }));
  const cards = projects.map((p) => ({
    slug: p.slug,
    category: p.category,
    node: <ProjectCard project={p} locale={locale} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />,
  }));

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl">{t('title')}</h1>
      <p className="mt-4 mb-12 max-w-2xl text-lg text-(--color-fg-2)">{t('intro')}</p>
      <WorkGrid options={options} cards={cards} />
    </div>
  );
}
