import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { site, text } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return pageMetadata({
    locale,
    pathname: '/contact',
    title: t('title'),
    description: t('intro'),
    ogImage: { ...site.seo.defaultOgImage, alt: t('title') },
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const socials = site.social.filter((s) => !s.placeholder);

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-(--color-fg-2)">{t('intro')}</p>

      {/* Email em texto simples e copiavel. Obfuscar por JS quebra leitores de
          ecra e copy-paste; recrutadores respondem do telefone e usam ATS. */}
      <a
        href={`mailto:${site.author.email}`}
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-(--color-accent) px-6 font-medium text-(--color-accent-on)"
      >
        {site.author.email}
      </a>

      <div className="mt-16 grid gap-12 border-t border-(--color-border) pt-12 md:grid-cols-2">
        <section>
          <h2 className="meta mb-4">{t('availableFor')}</h2>
          <ul className="space-y-1.5 text-(--color-fg-2)">
            {site.author.availability.lookingFor.map((i) => (
              <li key={text(i, locale)}>{text(i, locale)}</li>
            ))}
          </ul>
          <p className="mt-6 max-w-prose text-sm text-(--color-fg-muted)">
            {text(site.author.availability.detail, locale)}
          </p>
        </section>

        <section>
          <h2 className="meta mb-4">{t('location')}</h2>
          {/* Sem iframe de mapa: nao acrescenta nada e transfere IP para a
              Google, exigindo consentimento previo. */}
          <p className="text-(--color-fg-2)">
            {text(site.author.location, locale)} · UTC+1
          </p>

          {socials.length > 0 ? (
            <>
              <h2 className="meta mt-10 mb-4">{t('elsewhere')}</h2>
              <ul className="space-y-2">
                {socials.map((s) => (
                  <li key={s.kind}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex min-h-11 items-center text-(--color-accent) underline underline-offset-4"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
