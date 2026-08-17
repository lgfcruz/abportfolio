import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

/**
 * Envolve conteudo que nao existe no idioma pedido. Marca `lang` correctamente
 * (WCAG 3.1.2) e avisa o leitor, em vez de mostrar texto noutra lingua em silencio.
 */
export async function Fallback({
  from,
  locale,
  children,
}: {
  from: Locale;
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = await getTranslations('notice');
  if (from === locale) return <>{children}</>;
  return (
    <div lang={from}>
      <p className="meta mb-4 border-l-2 border-(--color-accent) pl-3 normal-case" lang={locale}>
        {from === 'en' ? t('onlyInEnglish') : t('onlyInPortuguese')}
      </p>
      {children}
    </div>
  );
}
