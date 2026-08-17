import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { Nav } from './Nav';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations('nav');

  const items = [
    { href: '/work', label: t('work') },
    { href: '/showreel', label: t('showreel') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-bg)/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={t('brandHome')} className="font-display text-sm tracking-tight uppercase md:text-base">
          {site.author.shortName}
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <LocaleSwitcher locale={locale} />
          <Nav items={items} cta={{ href: '/cv', label: t('cv') }} />
        </div>
      </div>
    </header>
  );
}
