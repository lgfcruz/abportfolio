import type { Metadata } from 'next';
import { site, absolute, text, type I18nText } from '@/lib/content';
import { locales, type Locale } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

/**
 * hreflang / canonical, conforme docs/03_ESPECIFICACAO_TECNICA.md seccao 2:
 * - canonical SEMPRE self-referencing por locale (nunca cross-locale)
 * - hreflang bidirecional e auto-referencial
 * - x-default aponta para /en, NUNCA para a raiz (que redireciona)
 */
export function alternates(pathname: string, locale: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    const href = absolute(getPathname({ href: pathname, locale: l }));
    languages[l === 'pt' ? 'pt-PT' : 'en'] = href;
  }
  languages['x-default'] = absolute(getPathname({ href: pathname, locale: 'en' }));

  return {
    canonical: absolute(getPathname({ href: pathname, locale })),
    languages,
  };
}

type PageMetaInput = {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
  ogImage?: { src: string; width: number; height: number; alt?: string } | null;
  ogType?: 'website' | 'article' | 'video.other';
  noindex?: boolean;
};

export function pageMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage,
  ogType = 'website',
  noindex = false,
}: PageMetaInput): Metadata {
  const img = ogImage ?? {
    src: site.seo.defaultOgImage.src,
    width: site.seo.defaultOgImage.width,
    height: site.seo.defaultOgImage.height,
    alt: site.author.shortName,
  };
  const url = absolute(getPathname({ href: pathname, locale }));
  const previewsBlocked = noindex || process.env.NEXT_PUBLIC_NOINDEX === 'true';

  return {
    title,
    description,
    alternates: alternates(pathname, locale),
    robots: previewsBlocked ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: ogType,
      title,
      description,
      url,
      siteName: site.site.name,
      locale: locale === 'pt' ? 'pt_PT' : 'en_US',
      alternateLocale: locale === 'pt' ? ['en_US'] : ['pt_PT'],
      images: [
        {
          url: absolute(img.src),
          width: img.width,
          height: img.height,
          alt: img.alt ?? title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absolute(img.src)],
    },
  };
}

export function titleFor(field: I18nText | string, locale: Locale, fallback: string): string {
  if (typeof field === 'string') return field;
  return text(field, locale) || fallback;
}

/* ------------------------------------------------------------------ JSON-LD */

export const PERSON_ID = `${site.site.url}/#arthur`;

export function personJsonLd(locale: Locale) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.author.shortName,
    alternateName: site.author.name,
    jobTitle: text(site.author.jobTitle, locale),
    description: text(site.author.tagline, locale),
    url: absolute(`/${locale}`),
    image: absolute(site.author.portrait.src),
    email: `mailto:${site.author.email}`,
    knowsLanguage: site.author.languages.map((l) => l.code),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lisboa',
      addressCountry: 'PT',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Universidade Lusófona',
      sameAs: 'https://www.ulusofona.pt/',
    },
    sameAs: site.social.filter((s) => !s.placeholder).map((s) => s.url),
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  trail: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absolute(getPathname({ href: t.path, locale })),
    })),
  };
}
