import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { site } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return pageMetadata({ locale, pathname: '/privacy', title: t('title'), description: t('intro'), noindex: true });
}

/**
 * A transparencia (RGPD arts. 13/14) nao e dispensada por a analitica ser
 * cookieless. Esta pagina e a condicao para nao ter banner de consentimento.
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacy');

  const pt = locale === 'pt';

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="text-4xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-(--color-fg-2)">{t('intro')}</p>

      <div className="prose-body mt-12 max-w-2xl text-(--color-fg-2)">
        <h3 className="text-(--color-fg)">{pt ? 'Analítica' : 'Analytics'}</h3>
        <p>
          {pt
            ? `Este site usa ${site.analytics.provider} para contar visitas de forma agregada. Não usa cookies, não guarda o endereço IP e não constrói perfis. Base legal: interesse legítimo (art. 6.1.f do RGPD). Podes opor-te bloqueando o domínio no teu navegador.`
            : `This site uses ${site.analytics.provider} to count visits in aggregate. It sets no cookies, does not store your IP address and does not build profiles. Legal basis: legitimate interest (GDPR art. 6(1)(f)). You may object by blocking the domain in your browser.`}
        </p>

        <h3 className="text-(--color-fg)">{pt ? 'Cookies' : 'Cookies'}</h3>
        <p>
          {pt
            ? 'Um único cookie funcional, NEXT_LOCALE, guarda o idioma que escolheste, durante um ano. Executa uma escolha tua, logo não exige consentimento. Nada mais é guardado no teu equipamento.'
            : 'A single functional cookie, NEXT_LOCALE, stores the language you chose, for one year. It carries out your own choice, so it does not require consent. Nothing else is stored on your device.'}
        </p>

        <h3 className="text-(--color-fg)">{pt ? 'Vídeos incorporados' : 'Embedded video'}</h3>
        <p>
          {pt
            ? 'Os vídeos do YouTube e do Vimeo só são carregados depois de clicares em reproduzir. Até esse momento não há qualquer pedido a esses serviços. Usamos youtube-nocookie.com e o modo "do not track" do Vimeo, mas ao reproduzir passas a estar sujeito às políticas de privacidade dessas plataformas.'
            : 'YouTube and Vimeo videos are only loaded after you click play. Until then no request is made to those services. We use youtube-nocookie.com and Vimeo’s do-not-track mode, but once you play a video you become subject to those platforms’ privacy policies.'}
        </p>

        <h3 className="text-(--color-fg)">{pt ? 'Contacto' : 'Contact'}</h3>
        <p>
          {pt
            ? `Se me escreveres por email, guardo essa mensagem apenas para te responder. Para qualquer questão sobre dados: `
            : `If you email me, I keep that message only in order to reply. For any question about data: `}
          <a href={`mailto:${site.author.email}`} className="text-(--color-accent) underline underline-offset-4">
            {site.author.email}
          </a>
        </p>
      </div>
    </div>
  );
}
