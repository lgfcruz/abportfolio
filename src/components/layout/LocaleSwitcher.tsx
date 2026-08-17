'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

/**
 * Dois <a> REAIS — nao um <select>, nao JS-only. Sao rastejaveis, abrem em nova
 * aba, e levam `lang`/`hrefLang` correctos. Preservam a rota actual: de
 * /pt/work/x vai para /en/work/x, nunca para a home.
 *
 * O cookie NEXT_LOCALE e escrito AQUI, no clique, e nao no proxy — porque o
 * matcher do proxy so cobre a raiz (ver src/proxy.ts). Cookie funcional: executa
 * uma escolha do utilizador, logo nao exige consentimento; consta da pagina de
 * privacidade. Nao usamos localStorage porque e invisivel ao servidor no
 * primeiro pedido e obrigaria a um redirect no cliente.
 */
/** Fora do componente: e uma escrita no DOM, nao estado de React. */
function remember(next: Locale) {
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations('locale');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="flex items-center">
      {locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            lang={l}
            hrefLang={l === 'pt' ? 'pt-PT' : 'en'}
            aria-current={active ? 'true' : undefined}
            aria-label={active ? undefined : t('switchTo', { language: t(l) })}
            onClick={() => remember(l)}
            className={`inline-flex min-h-11 items-center px-2 font-mono text-xs tracking-wider uppercase transition-colors ${
              active ? 'text-(--color-accent)' : 'text-(--color-fg-muted) hover:text-(--color-fg)'
            }`}
          >
            {l}
          </Link>
        );
      })}
    </nav>
  );
}
