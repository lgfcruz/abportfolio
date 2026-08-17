import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import localFont from 'next/font/local';
import { routing, type Locale } from '@/i18n/routing';
import { site, text, absolute } from '@/lib/content';
import { personJsonLd } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';
import { NavigationTracker } from '@/components/layout/NavigationTracker';
import { JsonLd } from '@/components/ui/JsonLd';

/**
 * Fontes AUTO-HOSPEDADAS com next/font/local, nao next/font/google.
 * Razoes: zero pedidos a fonts.googleapis.com (uma origem terceira menos, e uma
 * exposicao RGPD menos), build que nao depende de rede externa, e ficheiros
 * variaveis subsetados a latin + latin-ext por causa do portugues.
 * Origem dos ficheiros: pacotes @fontsource-variable (npm), copiados para src/fonts.
 */
const display = localFont({
  src: [
    { path: '../../fonts/archivo-var.woff2', style: 'normal' },
    { path: '../../fonts/archivo-var-ext.woff2', style: 'normal' },
  ],
  weight: '100 900',
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
const body = localFont({
  src: [
    { path: '../../fonts/inter-var.woff2', style: 'normal' },
    { path: '../../fonts/inter-var-ext.woff2', style: 'normal' },
  ],
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
const mono = localFont({
  src: '../../fonts/jetbrains-var.woff2',
  weight: '100 800',
  variable: '--font-jetbrains',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Sem user-scalable=no nem maximum-scale: bloquear zoom viola a WCAG 1.4.4. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0B',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const l = locale as Locale;

  return {
    metadataBase: new URL(site.site.url),
    title: {
      default: `${site.author.shortName} — ${text(site.author.jobTitle, l)}`,
      template: `%s — ${site.author.shortName}`,
    },
    description: text(site.author.tagline, l),
    keywords: site.seo.keywords[l],
    authors: [{ name: site.author.name, url: absolute(`/${l}/about`) }],
    creator: site.author.name,
    applicationName: site.site.name,
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const l = locale as Locale;

  // Necessario para que as paginas continuem estaticamente renderizadas.
  setRequestLocale(l);

  return (
    <html lang={l === 'pt' ? 'pt-PT' : 'en'} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider>
          <NavigationTracker />
          <SkipLink />
          <Header locale={l} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer locale={l} />
        </NextIntlClientProvider>
{/* Apenas o no Person, referenciavel por @id. A ProfilePage vive em /about —
            declarar aqui uma ProfilePage cujo url e /about seria contraditorio
            em 30 das 32 paginas. */}
        <JsonLd data={{ '@context': 'https://schema.org', ...personJsonLd(l) }} />
      </body>
    </html>
  );
}
