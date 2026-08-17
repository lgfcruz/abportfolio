import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site, text } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  const socials = site.social.filter((s) => !s.placeholder);

  return (
    <footer className="border-t border-(--color-border) py-12">
      <div className="container-page">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg">{site.author.shortName}</p>
            <p className="mt-1 text-sm text-(--color-fg-2)">{text(site.author.location, locale)}</p>
            <a
              href={`mailto:${site.author.email}`}
              className="mt-3 inline-block text-sm text-(--color-accent) underline decoration-(--color-accent)/40 underline-offset-4 hover:decoration-(--color-accent)"
            >
              {site.author.email}
            </a>
          </div>

          {socials.length > 0 ? (
            <nav aria-label={t('social')} className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <a
                  key={s.kind}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="min-h-11 py-2 text-sm text-(--color-fg-2) transition-colors hover:text-(--color-fg)"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-(--color-border) pt-6 text-xs text-(--color-fg-muted) md:flex-row md:items-center md:justify-between">
          {/* launchYear vem do JSON: `new Date()` numa pagina estatica congelaria
              no ano do build e diria 2026 em 2028. */}
          <p>{t('rights', { year: site.site.launchYear, name: site.author.name })}</p>
          <Link href="/privacy" className="hover:text-(--color-fg-2)">
            {t('privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
