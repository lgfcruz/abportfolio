import type { MetadataRoute } from 'next';
import { projects, absolute } from '@/lib/content';
import { locales } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

const STATIC_PATHS = ['/', '/work', '/showreel', '/showreel/breakdown', '/about', '/contact', '/cv'];

/**
 * Uma entrada por rota POR LOCALE, cada uma com os seus alternates.
 * A raiz `/` NAO entra: e um redirect, e nunca se poe um redirect no sitemap.
 * Rascunhos (status !== 'published') tambem nao entram.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC_PATHS, ...projects.map((p) => `/work/${p.slug}`)];
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    for (const locale of locales) {
      entries.push({
        url: absolute(getPathname({ href: path, locale })),
        lastModified: new Date(),
        changeFrequency: path === '/' ? 'monthly' : 'yearly',
        priority: path === '/' ? 1 : path.startsWith('/work/') ? 0.8 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l === 'pt' ? 'pt-PT' : 'en', absolute(getPathname({ href: path, locale: l }))]),
          ),
        },
      });
    }
  }

  return entries;
}
