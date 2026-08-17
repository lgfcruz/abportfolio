'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export type FilterOption = { slug: string; label: string };

/**
 * Filtros client-side sobre conteudo ja renderizado, para a pagina continuar
 * estatica. Sincroniza com a querystring via history.replaceState (link
 * partilhavel, sobrevive a refresh) sem provocar navegacao nem SSR.
 * O resultado e anunciado por aria-live.
 */
export function WorkGrid({
  options,
  cards,
  initial = 'all',
}: {
  options: FilterOption[];
  cards: { slug: string; category: string; node: ReactNode }[];
  initial?: string;
}) {
  const t = useTranslations('work');
  const [active, setActive] = useState(initial);

  const visible = useMemo(
    () => (active === 'all' ? cards : cards.filter((c) => c.category === active)),
    [active, cards],
  );

  function select(slug: string) {
    setActive(slug);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (slug === 'all') url.searchParams.delete('cat');
      else url.searchParams.set('cat', slug);
      window.history.replaceState(null, '', url);
    }
  }

  return (
    <>
      <fieldset className="mb-4 flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">{t('filterLegend')}</legend>
        {[{ slug: 'all', label: t('all') }, ...options].map((o) => (
          <button
            key={o.slug}
            type="button"
            aria-pressed={active === o.slug}
            onClick={() => select(o.slug)}
            className={`min-h-11 cursor-pointer rounded-full border px-4 font-mono text-xs tracking-wider uppercase transition-colors ${
              active === o.slug
                ? 'border-(--color-accent) bg-(--color-accent) text-(--color-accent-on)'
                : 'border-(--color-border-strong) text-(--color-fg-2) hover:text-(--color-fg)'
            }`}
          >
            {o.label}
          </button>
        ))}
      </fieldset>

      <p aria-live="polite" className="meta mb-10">
        {t('count', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="text-(--color-fg-2)">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <li key={c.slug}>{c.node}</li>
          ))}
        </ul>
      )}
    </>
  );
}
