import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * ATENCAO: no Next.js 16 este ficheiro chama-se `proxy.ts` (era `middleware.ts`)
 * e a funcao exportada e o default deste modulo. O nome antigo esta deprecado.
 *
 * O MATCHER COBRE APENAS A RAIZ, E E DELIBERADO.
 * Alargar o matcher faria todo o HTML passar por esta funcao em cada pedido,
 * perdendo o cache de HTML no CDN da Netlify. A consequencia e que o cookie
 * NEXT_LOCALE nao e escrito aqui — e escrito pelo seletor de idioma
 * (src/components/layout/LocaleSwitcher.tsx) atraves de uma Server Action.
 *
 * Se a negociacao de idioma "deixar de funcionar", verificar primeiro o nome
 * deste ficheiro e depois este matcher.
 */
export default createMiddleware(routing);

export const config = { matcher: ['/'] };
