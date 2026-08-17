import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('error');
  return (
    <div className="container-page flex min-h-[60vh] flex-col justify-center py-24">
      <p className="meta mb-3">404</p>
      <h1 className="text-4xl md:text-5xl">{t('notFoundTitle')}</h1>
      <p className="mt-4 max-w-prose text-(--color-fg-2)">{t('notFoundBody')}</p>
      <Link href="/" className="link-target mt-8 self-start text-(--color-accent) underline underline-offset-4">
        {t('backHome')}
      </Link>
    </div>
  );
}
