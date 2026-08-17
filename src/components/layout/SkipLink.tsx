import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
  const t = await getTranslations('nav');
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded focus:bg-(--color-accent) focus:px-4 focus:py-2 focus:font-medium focus:text-(--color-accent-on)"
    >
      {t('skipToContent')}
    </a>
  );
}
