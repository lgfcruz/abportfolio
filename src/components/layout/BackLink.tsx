'use client';

import { useTranslations } from 'next-intl';
// useRouter do next-intl, nao do next/navigation: o `push` deste conhece o
// locale e produz /pt/work; o do Next produzia /work, sem prefixo.
import { Link, useRouter } from '@/i18n/navigation';
import { hasInAppHistory } from '@/lib/navigation-signal';

/**
 * "Voltar" que volta de facto.
 *
 * O link fixo para /work era um bug: quem chegava da pagina inicial clicava em
 * "voltar" e aterrava no indice de trabalhos, uma pagina onde nunca tinha
 * estado. Aqui:
 *
 *  - se ja houve navegacao dentro do site nesta aba, `router.back()` devolve a
 *    pagina exacta E a posicao de scroll (o App Router restaura-a);
 *  - se a pessoa entrou directamente neste URL (link partilhado, LinkedIn,
 *    resultado de pesquisa), `back()` levava-a PARA FORA do site — por isso
 *    nesse caso navegamos para o indice de trabalhos.
 *
 * A decisao e tomada no cliente para nao quebrar a pre-renderizacao. Ate a
 * hidratacao, o que esta no HTML e o link real para o indice — degrada bem.
 */
export function BackLink({ fallbackHref = '/work' }: { fallbackHref?: string }) {
  const t = useTranslations('project');
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (hasInAppHistory()) router.back();
        else router.push(fallbackHref);
      }}
      className="meta link-target cursor-pointer transition-colors hover:text-(--surface-fg)"
    >
      <span aria-hidden="true" className="mr-2">
        ←
      </span>
      {t('back')}
    </button>
  );
}

/** Versao sem JavaScript, para o HTML pre-renderizado e para o <noscript>. */
export function BackLinkFallback({ href = '/work' }: { href?: string }) {
  const t = useTranslations('project');
  return (
    <Link href={href} className="meta link-target hover:text-(--surface-fg)">
      <span aria-hidden="true" className="mr-2">
        ←
      </span>
      {t('backToWork')}
    </Link>
  );
}
