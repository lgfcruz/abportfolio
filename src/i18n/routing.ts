import { defineRouting } from 'next-intl/routing';

export const locales = ['pt', 'en'] as const;
export type Locale = (typeof locales)[number];

/**
 * Estrategia decidida em docs/03_ESPECIFICACAO_TECNICA.md, seccao 2:
 *
 * - `localePrefix: 'always'` => cada URL tem um unico conteudo possivel, logo e
 *   cacheavel como ficheiro estatico. Evita o bug "o primeiro visitante escolhe
 *   o idioma de todos".
 * - `defaultLocale: 'en'` => coerente com o x-default. O Googlebot nao envia
 *   Accept-Language e rasteja de IPs dos EUA, logo cai em /en, que e exactamente
 *   o destino do x-default. Assim NAO e preciso detectar crawlers (sniffing de
 *   user-agent seria "sneaky redirect" nas diretrizes do Google).
 * - `localeDetection: true` => negocia Accept-Language, mas so na raiz (ver proxy.ts).
 * - `alternateLinks: false` => o hreflang e declarado no HTML via generateMetadata,
 *   nao no header Link, porque o proxy so corre na raiz.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' },
  alternateLinks: false,
});
