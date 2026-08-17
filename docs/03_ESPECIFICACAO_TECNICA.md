# Especificação técnica — Arthur Brabo Portfolio

**Data:** 17 de agosto de 2026
**Aplica-se à:** Fase 3 do `00_PLANO_MESTRE_v2.md` (só arrancar depois dos Portões 1 e 2)

---

## 1. Stack e versões

Versões confirmadas no registry npm em 17/08/2026:

| Pacote | Versão | Nota |
|---|---|---|
| `next` | 16.3.1 | App Router |
| `react` / `react-dom` | 19.2.8 | |
| `typescript` | 7.0.2 | `strict` + `noUncheckedIndexedAccess` |
| `tailwindcss` | 4.3.3 | Config em CSS (`@theme`), não em JS |
| `next-intl` | 4.13.7 | i18n |
| `zod` | 4.4.3 | Validação de frontmatter, uso mínimo |
| `sharp` | 0.35.3 | Pipeline de imagem no build |
| Node | 22 LTS | Fixar em `.nvmrc` **e** em `netlify.toml` |

### Mudanças do Next.js 16 que afetam este projeto

Estas quatro não são detalhes — cada uma quebra silenciosamente algo:

1. **`middleware.ts` foi renomeado para `proxy.ts`**, e a função exportada passou de `middleware` para `proxy`. O nome antigo está **deprecado mas continua a funcionar** (é hoje a única via para o runtime `edge`), e emite aviso no build. Usar `proxy.ts` desde o início; e se a negociação de idioma "não funcionar", é o nome do ficheiro a primeira coisa a verificar.
2. **`next lint` foi removido** e o `next build` já não faz lint. O ESLint tem de correr explicitamente (script `npm run lint`).
3. **`images.qualities` passou a ter o default `[75]`** e o `quality` pedido é forçado ao valor mais próximo da lista. Para peças de portfólio, declarar `qualities: [75, 90]` em `next.config.ts`.
4. **`revalidateTag()` de argumento único está deprecado.** Não relevante hoje (o site é 100% estático), mas convém não criar dependências de caching implícito.

### Ferramentas: o que compensa e o que é excesso

**Fica:** TypeScript strict, ESLint 9 flat config (`eslint.config.mjs`) com `@next/eslint-plugin-next` e `eslint-plugin-jsx-a11y`, Prettier, e **um** smoke test em Playwright (~30 linhas: a raiz redireciona, `/pt/work/<slug>` e `/en/work/<slug>` devolvem 200, existe `hreflang`, existe um único `h1`). Apanha a maioria das regressões reais.

**O teste de contraste dos tokens** (secção 15) corre dentro do `npm run validate`, não num runner de testes: é uma função de ~20 linhas em `scripts/validate.mjs` que calcula os rácios de cada par declarado e sai com código 1 se algum descer abaixo de 4,5 (texto) ou 3,0 (componentes). Assim não é preciso introduzir Vitest só para isso.

**Sai:** Vitest, Playwright completo, Storybook, GitHub Actions como gate de merge, branch protection, Renovate, `npm run new-project`. Para um site de 6–10 projetos mantido por uma pessoa, isto é teatro de engenharia — e cria um sistema que só uma pessoa sabe operar.

---

## 2. Internacionalização — a decisão resolvida

O arquiteto frontend e o consultor de SEO discordaram. Esta é a resolução, e é a versão mais simples das três propostas.

### Configuração

```ts
// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'en',        // coerente com x-default
  localePrefix: 'always',     // /pt/work e /en/work — nunca uma URL sem prefixo
  localeDetection: true,      // negocia Accept-Language, mas SÓ na raiz (ver matcher)
  localeCookie: {maxAge: 60 * 60 * 24 * 365},
  alternateLinks: false       // hreflang declarado no HTML via generateMetadata
});
```

```ts
// src/proxy.ts   ← NOTA: no Next.js 16 este ficheiro NÃO se chama middleware.ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

// IMPORTANTE: o matcher cobre APENAS a raiz, e é deliberado.
// Alargá-lo faria todo o HTML passar pela função de proxy em cada pedido,
// perdendo o cache de HTML no CDN. Ver secção "Riscos".
export const config = {matcher: ['/']};
```

### Como funciona, e porque é assim

**`localePrefix: 'always'`** garante que **cada URL tem um único conteúdo possível** — condição necessária para ser um ficheiro estático cacheável. Com `as-needed`, o URL canónico de um locale seria o mesmo que o CDN teria de servir consoante o cookie, e é exatamente aí que nasce o bug clássico: *o primeiro visitante escolhe o idioma de todos*.

**A raiz `/` é o único ponto de decisão.** Recebe um `307` (nunca `301` — o mapeamento não é permanente) para `/pt` se o `Accept-Language` contiver `pt`, e para `/en` em todos os outros casos. `/pt/*` e `/en/*` **nunca redirecionam**; devolvem sempre `200` com o que foi pedido.

Isto resolve o problema que o consultor de SEO levantou: o Googlebot não envia `Accept-Language` por defeito e rasteja predominantemente de IPs dos EUA. Com este desenho, ele cai em `/en` — que é exatamente o destino do `x-default`. **Não é preciso detetar crawlers.**

> **Decisão importante: não fazer sniffing de user-agent.** Um redirect condicionado por user-agent é literalmente *sneaky redirect* nas diretrizes do Google, ao contrário de um redirect por header, que é comportamento aceite. Ao inverter o default para `/en`, eliminamos a categoria de risco em vez de a mitigarmos com uma lista de bots que envelhece mal.

**Links partilhados são sempre previsíveis.** Se o Arthur enviar `/pt/work/criatura` a um produtor português, essa pessoa vê a página portuguesa — mesmo com o browser em inglês. Este é o canal real deste site: um link em email, LinkedIn ou Discord.

### Persistência da escolha manual

Cookie `NEXT_LOCALE`, um ano, `SameSite=Lax`. Como o proxy só corre em `/`, o cookie é escrito **pelo seletor**, via Server Action com `(await cookies()).set(...)`.

**Não usar `localStorage`:** só existe depois da hidratação, é invisível ao servidor no primeiro pedido, e obrigaria a um redirect no cliente — o que produz flash de conteúdo errado, CLS, e um segundo salto.

Nota RGPD: `NEXT_LOCALE` é um cookie **estritamente funcional** (executa uma escolha do utilizador), pelo que não exige consentimento. Deve, ainda assim, constar da página de privacidade.

### hreflang, canonical, sitemap

```ts
// gerado em generateMetadata de cada rota
alternates: {
  canonical: `${SITE}/${locale}${path}`,      // SEMPRE self-referencing por locale
  languages: {
    'pt-PT': `${SITE}/pt${path}`,
    'en':    `${SITE}/en${path}`,
    'x-default': `${SITE}/en${path}`          // NUNCA apontar para a raiz, que redireciona
  }
}
```

- **`pt-PT`**, não `pt` — para não competir com pt-BR.
- **`en`** sem região — a audiência é global (UK, Canadá, EUA, Austrália).
- **Canonical sempre self-referencing por locale.** Canonical cross-locale desindexa uma das versões.
- **hreflang bidirecional e auto-referencial.** O Google ignora hreflang sem return links.
- **A raiz fica fora do sitemap** (é um redirect).
- `app/sitemap.ts` gera uma entrada por rota **por locale**, com `alternates.languages`.
- `app/robots.ts` sem `Disallow`, com `Sitemap:`.

### O que se traduz e o que não

| Não traduzir | Traduzir |
|---|---|
| Títulos de projeto | `summary`, `body`, `alt`, legendas |
| Nomes de software (`Maya`, `Substance 3D Painter`, `Dragonframe`) | Labels de UI e de download |
| Nomes de pessoas e de instituições | `role` / cargos — **como enum**, traduzido em `messages/*.json`, nunca escrito à mão por projeto (garante "Rigging" e não "rigging") |

### Decisão de conteúdo: interface bilíngue, breakdowns em inglês

O plano v1 e o consultor de SEO pediam breakdowns de 300–600 palavras por projeto, nos dois idiomas. Para 6–10 projetos isso são **12 a 20 textos** escritos por um estudante que ainda não editou o showreel. Não é realista, e o modo de falha é previsível: metade dos textos em português ficam desatualizados.

**Regra:**

- **Bilíngue (pt-PT + en):** interface, navegação, home, página "Sobre", CV, contacto, metadados SEO
- **Só inglês:** breakdowns longos e corpo dos case studies

Ninguém, em Lisboa ou em Londres, penaliza um breakdown técnico em inglês. Um breakdown em português desatualizado penaliza.

**Fallback:** função `pick(field, locale)` que devolve `{value, from}`. Se o locale pedido não existir, usa o outro, envolve o bloco em `<div lang="en">` e mostra um aviso discreto ("Texto disponível apenas em inglês"). A página **continua a existir nos dois locales** — o `hreflang` mantém-se, e não se põe `noindex` por fallback parcial.

---

## 3. Renderização e deploy

**Não usar `output: 'export'`.** Export estático é incompatível com `proxy.ts` (não corre), com a otimização do `next/image`, e com a deteção de locale — perderíamos exatamente o requisito pedido.

**Usar o output por defeito + o adaptador OpenNext do Netlify** (automático; **não** fixar `@netlify/plugin-nextjs`). Todas as páginas são pré-renderizadas no build — SSG puro na prática, porque não há dados dinâmicos — e o Netlify serve-as do Full Route Cache com cache durável.

**Ganha-se:** a função de proxy (negociação de idioma), o Netlify Image CDN via `next/image`, headers e skew protection.
**Perde-se:** um único salto de função na raiz, e a impossibilidade de servir o site de um bucket estático simples.

> Nota: no Next.js 16 o `proxy` corre no runtime **Node.js** e o runtime **não é configurável** — não é uma edge function. Isso não altera a decisão (o argumento de cache mantém-se por inteiro), mas explica por que razão vale a pena manter o matcher restrito à raiz: cada pedido que passa pelo proxy é um pedido que não é servido do cache de HTML.

O `netlify.toml` completo está em `01_AUDITORIA_DEPLOY_NETLIFY.md`, secção 5.

---

## 4. Modelo de conteúdo

**Um ficheiro MDX por projeto + uma pasta de imagens com o mesmo slug.** Frontmatter validado por um esquema Zod mínimo (~40 linhas) que corre no build.

O critério que decidiu isto não foi elegância. Foi este teste:

> **O Arthur consegue acrescentar um projeto sozinho, num sábado, dentro de dois anos, sem se lembrar de nenhum comando?**

Se a resposta exigir um script gerador, um JSON Schema e um editor configurado, a arquitetura está errada — e o portfólio dele passou a ser propriedade operacional de outra pessoa. Arrastar ficheiros para uma pasta e escrever texto num `.mdx` passa o teste.

```
content/projects/
  criatura-quadrupede.mdx
  personagem-humanoide.mdx
public/media/
  criatura-quadrupede/
    cover.jpg  hero.jpg  og.jpg
    process-01-concept.jpg  process-02-topology.jpg  ...
```

### Frontmatter

```yaml
---
slug: criatura-quadrupede
status: published                 # published | draft
title: "Nome da criatura"          # não traduz
year: 2025
order: 1
featured: true
surface: dark                      # dark | mid | light  (ver secção 6)
context: individual                # individual | grupo
team: "Equipa de 4"                # opcional
duration: "6 semanas"
institution: "Universidade Lusófona"
role: [modeling, uv, texturing, rigging, animation]   # enum, traduzido na UI
software: ["Autodesk Maya", "Substance 3D Painter", "Arnold"]
summary:
  pt: "Criatura quadrúpede não humanoide, do concept ao ciclo de locomoção."
  en: "Non-humanoid quadruped creature, from concept to locomotion cycle."
cover: {src: cover.jpg, w: 1800, h: 1200, alt: {pt: "...", en: "..."}}
hero:  {src: hero.jpg,  w: 2560, h: 1440, alt: {pt: "...", en: "..."}}
og:    og.jpg
video: {provider: vimeo, id: "000000000"}
poster: {src: poster.jpg, w: 1920, h: 1080}
specs:
  tris: "42k"
  maps: "4K albedo, roughness, normal, height"
  rig: "58 controlos, 6 blendshapes"
links:
  - {kind: artstation, url: "https://..."}
---
```

O corpo do MDX é Markdown normal — sem componentes React — com as secções: **Contexto → O meu papel → Vídeo final → O problema e a decisão → Processo → Especificações → O que faria diferente**.

### Validação em build (`npm run validate`)

Corre antes do `next build` no `netlify.toml`. Falha (exit 1) se:

1. O frontmatter não passar o esquema Zod (erros formatados com `z.prettifyError`)
2. Existirem slugs duplicados
3. Uma imagem referenciada não existir em disco, ou as dimensões declaradas não baterem com o ficheiro real (`sharp.metadata()`), com `--fix` para reescrever
4. Um projeto `published` não tiver `cover`, `summary` em pelo menos um idioma, ou `poster` quando tem vídeo
5. Uma chave em `messages/pt.json` não existir em `messages/en.json`, ou vice-versa

Avisa, mas não falha, quando falta uma tradução opcional.

Se o `validate` falhar, o deploy da Netlify falha e **o deploy anterior mantém-se em produção**.

---

## 5. Estrutura de diretórios

```
src/
  proxy.ts                          ← negociação de idioma, matcher ['/']
  app/
    layout.tsx  sitemap.ts  robots.ts  not-found.tsx
    [locale]/
      layout.tsx                    → generateStaticParams (locales)
      page.tsx                      (home)
      work/page.tsx                 (índice)
      work/[slug]/page.tsx          → generateStaticParams (locales × slugs published)
      showreel/page.tsx
      showreel/breakdown/page.tsx   ← alternativa textual do reel (a11y + SEO)
      about/page.tsx  contact/page.tsx  cv/page.tsx  privacy/page.tsx
  i18n/       routing.ts  navigation.ts  request.ts
  components/
    media/    Picture  VideoFacade  MediaBlock  Lightbox
    layout/   Nav  LocaleSwitcher  Footer  SkipLink
    work/     ProjectCard  Gallery  Breakdown  ProjectMeta  NextProject
    ui/       Button  Badge  SectionHeading  Container
  lib/
    content/  schema.ts  registry.ts  pick.ts
    seo/      alternates.ts  jsonld.ts
messages/     pt.json  en.json
content/projects/*.mdx
public/media/<slug>/*
public/docs/arthur-brabo-cv-2026.pdf
scripts/validate.mjs
```

Só `[locale]` e `[locale]/work/[slug]` precisam de `generateStaticParams`; as restantes herdam do layout.

---

## 6. Design tokens

Valores corrigidos após cálculo de contraste. Os do plano v1 falhavam AA — ver a tabela de razões na secção 7.

```css
/* app/globals.css — Tailwind 4 configura-se em CSS */
@theme {
  --color-bg:            #0A0A0B;   /* surface: dark */
  --color-surface:       #131316;
  --color-surface-up:    #1B1B1F;   /* surface: mid  */

  --color-border:        rgb(255 255 255 / 0.07);  /* só separadores decorativos */
  --color-border-strong: #6F7582;                  /* qualquer componente funcional */

  --color-text:          #F5F7FA;
  --color-text-2:        #A6ACB8;
  --color-text-muted:    #8A91A0;   /* corrigido de #6F7582, que falhava AA */

  --color-accent:        #FF6A3D;
  --color-accent-on:     #0A0A0B;   /* texto SOBRE o laranja. NUNCA branco */
  --color-accent-light:  #C2410C;   /* variante para superfície clara */

  /* superfície clara, para trabalho toon e animação 2D */
  --color-light-bg:      #F2F1EE;
  --color-light-text:    #16171A;

  --font-display: 'Archivo Expanded', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;
}
```

**Superfície como token por projeto.** O invólucro (nav, índice, footer) é sempre escuro. Cada página de projeto declara `surface` no frontmatter, aplicada via `data-surface` no elemento raiz da página:

| `surface` | Fundo | Texto | Para que trabalho |
|---|---|---|---|
| `dark` | `#0A0A0B` | `#F5F7FA` | Criatura, lighting, VFX |
| `mid` | `#1B1B1F` | `#F5F7FA` (16,00:1) | Stop motion — dá presença física a sets e puppets sem os afundar em preto |
| `light` | `#F2F1EE` | `#16171A` (15,87:1) | Trabalho toon, animação 2D |

Razão: materiais toon e animação 2D são chapados e saturados, e vibram mal sobre grafite frio. Não é inconsistência — é o que uma galeria faz. **Os três pares de texto/fundo passam AAA**, pelo que a mudança de superfície não abre um buraco de acessibilidade.

**Regras do laranja `#FF6A3D`:**

- ✅ Texto sobre qualquer fundo escuro (6,03–6,96:1)
- ✅ Preenchimento de botão, **com texto `#0A0A0B`** por cima (6,96:1)
- ❌ Branco sobre laranja — 2,85:1, falha AA
- ❌ Qualquer uso como texto, link, ícone ou borda em superfície clara — 2,52:1, falha até 3:1. Em superfície clara, o laranja só serve como massa de cor, com texto quase-preto por cima. Se for indispensável como texto, `#C2410C` dá 4,59:1 sobre `#F2F1EE` — passa AA, mas por 0,09 de margem, pelo que não deve ser usado abaixo de 16 px

**Tipografia:** máximo 2 pesos por família, WOFF2 subsetado (latin + latin-ext, por causa do português), via `next/font` com `display: swap` e fallback métrico.

---

## 7. Contrastes calculados

Verificados pela fórmula WCAG. As células em **negrito** falham.

| | `#0A0A0B` | `#131316` | `#1B1B1F` |
|---|---|---|---|
| `#F5F7FA` | 18,44 ✓ | 17,28 ✓ | 16,00 ✓ |
| `#A6ACB8` | 8,68 ✓ | 8,14 ✓ | 7,53 ✓ |
| `#8A91A0` (corrigido) | 6,26 ✓ | 5,86 ✓ | 5,43 ✓ |
| `#6F7582` (v1) | **4,28** | **4,01** | **3,71** |
| `#FF6A3D` | 6,96 ✓ | 6,52 ✓ | 6,03 ✓ |

Outros pares relevantes:

| Par | Razão | Veredicto |
|---|---|---|
| branco sobre `#FF6A3D` | 2,85 | ❌ falha AA e falha 3:1 |
| `#0A0A0B` sobre `#FF6A3D` | 6,96 | ✓ AA |
| `#FF6A3D` sobre `#F2F1EE` | 2,52 | ❌ falha até 3:1 |
| `#C2410C` sobre `#F2F1EE` | 4,59 | ✓ AA, mas margem fina — não abaixo de 16 px |
| `#16171A` sobre `#F2F1EE` | 15,87 | ✓ AAA |
| `rgba(255,255,255,0.07)` sobre `#0A0A0B` (compõe `#1B1B1C`) | **1,15** | ❌ falha 1.4.11 (3:1) para componentes funcionais |
| `rgba(255,255,255,0.38)` sobre `#0A0A0B` | 3,50 | ✓ 1.4.11 — alternativa a `#6F7582` para bordas funcionais |

**Consequência prática:** `#6F7582` não pode ser usado em placeholders, legendas, contadores nem metadados em mono a 14 px. E bordas com alfa de 0,07 servem para separadores decorativos redundantes, nunca para bordas de campos de formulário, botões-fantasma, checkboxes ou indicadores de estado ativo — esses precisam de `#6F7582` sólido ou `rgba(255,255,255,0.38)`.

**Anel de foco:** 2 px `#FF6A3D` com 2 px de offset, mais `scroll-margin-top` igual à altura do header fixo (cumpre 2.4.11 Foco Não Obscurecido).

---

## 8. Mídia

### Imagens

`next/image` normal — o adaptador da Netlify encaminha para o Netlify Image CDN (`/.netlify/images`) sem configuração. Nada de `unoptimized`, nada de loader custom.

- Servir **AVIF com fallback WebP** (`next/image` negocia por `Accept`). Saltar JPEG.
- Larguras responsivas: `[384, 640, 828, 1080, 1200, 1920, 2560]`. **Nada acima de 2560 px** — full-res, se se quiser oferecer, é um link de download explícito.
- `qualities: [75, 90]` em `next.config.ts` (o default do Next 16 é só `[75]`).
- **`sizes` explícito é onde 90% dos portfólios falham.** Grelha de 3 colunas: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`. Hero full-bleed: `sizes="100vw"`. Errar o `sizes` faz o browser descarregar a variante de 2560 px para uma miniatura de 400 px.
- **`priority` em exatamente uma imagem por página** — a do LCP. Todas as outras `loading="lazy"`.
- Placeholder: **LQIP inline** (base64 de 10–20 px, ~200–400 bytes), gerado no build por `sharp`.
- `width`/`height` sempre presentes. É o que mantém CLS a zero.

**Galeria com muitas imagens:** o índice `/work` mostra **uma** thumbnail por projeto (≤600 px, AVIF, 30–50 KB) — 12 projetos = ~500 KB, aceitável. Na página de projeto, 6–8 imagens em lazy, o resto atrás de `IntersectionObserver` com `rootMargin: '200px'`. Lightbox carrega a versão grande só ao clique, com `preload` do vizinho seguinte. Se um projeto tem 40 stills, isso é um problema de curadoria, não de performance.

### Vídeo — fachada clicável, obrigatória

Um embed padrão do YouTube pesa **~1,2 MB em 20+ requisições, antes de qualquer clique**. Com 4 vídeos numa página, o iframe nativo custa ~5 MB e destrói o INP.

Implementação (`VideoFacade`): Server Component que desenha um `<button type="button">` com `<Image>` do poster **auto-hospedado** (não `i.ytimg.com`, que é origem terceira e cujo `maxresdefault` falha em alguns vídeos) e um ícone de play. Ao clique, um Client Component insere o iframe:

- YouTube: `https://www.youtube-nocookie.com/embed/<ID>?autoplay=1`
- Vimeo: `https://player.vimeo.com/video/<ID>?autoplay=1&dnt=1`

O foco move-se para o iframe. `<link rel="preconnect">` para o domínio do player **apenas em hover/focus** do botão, nunca no `<head>`.

**Isto é também compliance:** nada de terceiros é carregado até um ato afirmativo do utilizador, e `youtube-nocookie` + `dnt=1` reduzem a exposição RGPD.

**`MediaBlock`** recebe `Img | Video` e despacha, para que a galeria e o breakdown aceitem ambos sem `if` nas páginas.

### Longevidade do reel

O ID do vídeo vive em `content/config/showreel.mdx`, nunca embutido num componente. Título datado visivelmente ("Showreel 2026") para que um reel antigo se leia como arquivo e não como negligência.

---

## 9. Animação

**CSS puro como base:** `@starting-style`, `transition`, `animation-timeline: view()` para reveals ao scroll. **View Transitions** (React 19.2 `<ViewTransition>`) para o cross-fade entre índice e detalhe. `motion` v13 apenas *lazy*, num único Client Component, e só se aparecer algo genuinamente imperativo (drag na galeria).

Razão: num site cujo conteúdo são imagens grandes, ~30 kB de JS de animação competem diretamente com o LCP. GSAP, Lenis ou Framer Motion completos custam 60–150 kB.

### Contrato de `prefers-reduced-motion: reduce`

**Desligar:** reveal-on-scroll (os elementos entram já visíveis, com `opacity:1; transform:none` — **nunca** `display:none`), parallax, hover `scale(1.02)`, transições de página (troca instantânea), contadores animados, cursor personalizado, texto que entra letra a letra.

**Manter:** mudanças de cor e opacidade ≤200 ms, anel de foco, spinners pequenos.

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

**Loop de vídeo no hero:** sem áudio e sem `autoplay` em reduced-motion — renderizar poster estático + botão "Reproduzir animação de fundo". Com movimento permitido, um loop acima de 5 segundos exige, por **2.2.2**, um controlo de pausa persistente, visível e alcançável por teclado (não apenas em hover). Um loop infinito **não** está isento.

**2.3.1 Três Flashes:** nenhum corte acima de 3 flashes/s no loop nem no showreel. Se existirem sequências estroboscópicas de VFX, aviso antes do play.

**Cursor personalizado:** aceitável **apenas** como adorno adicional sobre o cursor real, mantendo alvo e precisão idênticos, desativado em `prefers-reduced-motion` e em `pointer: coarse`. **Nunca esconder o cursor do sistema** — prejudica utilizadores com baixa visão e com tremor.

---

## 10. Acessibilidade — especificação por componente

### Fachada de vídeo
`<button type="button">` a envolver a thumbnail (`<img alt="">` decorativa) + `<span>` com nome acessível: *"Reproduzir showreel 2026, 1 min 5 s"* — a duração real, gerada a partir do frontmatter, não escrita à mão. Ao clicar, substitui-se por `<iframe title="Showreel 2026" allow="fullscreen">` e o foco move-se para o iframe. **Nunca** `<div role="button">` sem `tabindex` e handler de teclado.

### Lightbox
`<dialog>` nativo com `showModal()` — fica em top-layer, ESC funciona nativamente, o foco fica contido. `aria-labelledby` a apontar para o título da peça. Botões reais: Fechar, Anterior, Seguinte, com `aria-label`. Setas ←/→ ligadas. `aria-live="polite"` a anunciar "Imagem 3 de 12". A imagem é `<img>` com alt real — **nunca** `background-image`. Ao fechar, o foco regressa ao gatilho. Alvos ≥44×44 px.

### Seletor de idioma
Dois `<a>` reais para `/pt` e `/en` — não um `<select>`, não JS-only. `<a lang="en" hreflang="en">English</a>`, com `aria-current="true"` no ativo. **Preserva a rota atual** (de `/pt/work/x` vai para `/en/work/x`, não para a home). Rótulos no idioma de destino, não bandeiras isoladas.

### Menu mobile
`<button aria-expanded="false" aria-controls="nav-mobile">` com `aria-label="Menu"`. O painel é `<nav id="nav-mobile">` com `<ul>`. Ao abrir: foco no primeiro item, `inert` no resto da página, sem scroll do body. ESC fecha e devolve o foco ao botão. **Não** usar `aria-hidden` no painel aberto.

### Filtros de categoria
`<fieldset>` com `<legend>` invisível "Filtrar por categoria". Botões com `aria-pressed`. Resultado num contentor com `aria-live="polite"` a anunciar "8 projetos". Sincronizar com a querystring (`?cat=3d`) para ser partilhável e sobreviver a refresh. O foco não salta.

### Cartão de projeto
`<article>` com `<h3><a href="/pt/work/slug">Título</a></h3>`. O efeito "cartão inteiro clicável" faz-se com um `::after` posicionado sobre o cartão a partir do `<a>` — assim há **um só** tab stop, o nome acessível é o título, e não há link aninhado nem div clicável. Metadados (ano, software) como texto **fora** do link.

### Showreel com música
**1.2.2 (A)** exige legendas para a faixa sonora. Para música sem fala, a legenda legítima é um `.vtt` de 5 linhas com `[Música: título — artista]` e qualquer informação sonora relevante.
**1.2.3 (A) / 1.2.5 (AA)** exigem descrição do conteúdo visual. A alternativa razoável é a página `/showreel/breakdown` com a lista de planos e timecodes (`00:12 — modelação de criatura, Maya/Substance`), ligada imediatamente sob o vídeo. **Serve dupla função:** cumpre 1.2.3 e é conteúdo indexável e legível por recrutadores.
Sem autoplay com som (**1.4.2**).

### Política de `alt`

O `alt` descreve **o que é visível e por que interessa**, em ≤150 caracteres, sem "imagem de" nem nome de ficheiro. O contexto técnico vive no `<figcaption>`, não no alt.

| | Mal | Bem |
|---|---|---|
| Render | `alt="render"` / `alt="final_v12.png"` | `alt="Cabeça de criatura em plano fechado, luz lateral azul, pele escamada."` / EN `alt="Close-up of a creature head, blue side lighting, scaled skin."` |
| Layout de UV | `alt="uv"` | `alt="Mapa UV da criatura: cabeça, torso e membros em ilhas separadas, densidade uniforme de texéis."` |
| Wireframe | `alt="wireframe"` | `alt="Wireframe do mesmo modelo, malha quad limpa com maior densidade em torno das articulações."` |
| Turntable | — | `alt="Turntable de 360° da criatura sobre fundo cinza."` + controlo de pausa (2.2.2) |
| Decorativa | omitir o atributo | `alt=""` |

**1.4.5 Imagens de Texto (AA):** nada de títulos, nomes de secção ou dados de contacto como imagem. Texto real com CSS. A exceção legítima é um frame de render que contenha tipografia como parte da arte — nesse caso o alt transcreve o texto essencial.

### Teclado e leitor de ecrã

**Ordem de tabulação na home:** skip link ("Saltar para o conteúdo principal", visível ao receber foco, primeiro no DOM) → logo → nav → seletor de idioma → CTA Showreel → CTA CV → `<main>`: play do hero → cartões de projeto (1 stop cada) → contacto → footer.

**Cabeçalhos:** home `h1` = "Arthur Brabo — Animador" / "Arthur Brabo — Animator" (um só, e tem de coincidir com o `jobTitle` do JSON-LD na secção 11 e com o título do CV — três sítios, uma formulação), `h2` por secção, `h3` nos títulos de cartão. Página de projeto: `h1` = nome do projeto, `h2` = Contexto/Processo/Especificações, `h3` = etapas. Sem saltos de nível.

**App Router:** em cada navegação, mover o foco para o `<h1>` (`tabIndex={-1}` + `focus()`) e anunciar via região `aria-live="polite"` com o novo título. Restaurar scroll para o topo. `metadata` por rota garante o critério 2.4.2.

### Conformidade legal — o que se aplica de facto

- **DL 83/2018** (Diretiva (UE) 2016/2102): abrange organismos do setor público e estabelecimentos de ensino com financiamento público, nas suas funções administrativas eletrónicas. **Um portfólio pessoal não está abrangido.**
- **European Accessibility Act** (Diretiva (UE) 2019/882, transposta pelo DL 82/2022 + Portaria 220/2023, aplicável desde 28/06/2025): abrange produtos e serviços B2C definidos — comércio eletrónico, banca, transportes, comunicações, audiovisual. **Um portfólio informativo fica fora.** Se algum dia vender assets, cursos ou comissões online, torna-se comércio eletrónico e o EAA passa a aplicar-se.
- **RGPD:** aplica-se sempre que houver formulário, analytics ou embeds de terceiros.

**Porque cumprir mesmo sem obrigação:** estúdios que trabalham para clientes institucionais, broadcasters públicos, museus e agências estão eles próprios sob o DL 83/2018 e o EAA, e fazem *due diligence* de fornecedores. Um portfólio conforme é prova de competência técnica. Acresce que o público real inclui recrutadores com daltonismo (~8% dos homens) a ver miniaturas num telefone ao sol — e que este é o único terreno onde o Arthur controla 100% do output. Falhas visíveis aqui leem-se como descuido.

---

## 11. SEO

### Dados estruturados que valem a pena

**`ProfilePage` + `Person`** em `/about`, referenciado por `@id` nas restantes páginas:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://arthurbrabo.com/en/about#profilepage",
  "url": "https://arthurbrabo.com/en/about",
  "inLanguage": "en",
  "mainEntity": {
    "@type": "Person",
    "@id": "https://arthurbrabo.com/#arthur",
    "name": "Arthur Brabo",
    "jobTitle": "Animator — 3D Character & Stop Motion",
    "description": "Animator based in Lisbon, working in 3D character animation and stop motion. Maya, Substance 3D Painter, Dragonframe.",
    "url": "https://arthurbrabo.com/en",
    "image": "https://arthurbrabo.com/og/arthur-brabo.jpg",
    "knowsLanguage": ["pt-PT", "en", "ja"],
    "knowsAbout": ["3D Animation", "Character Animation", "Stop Motion",
      "3D Modelling", "Rigging", "Texturing", "Autodesk Maya",
      "Substance 3D Painter", "Dragonframe"],
    "alumniOf": {"@type": "CollegeOrUniversity",
      "name": "Universidade Lusófona", "sameAs": "https://www.ulusofona.pt/"},
    "address": {"@type": "PostalAddress",
      "addressLocality": "Lisboa", "addressCountry": "PT"},
    "seeks": {"@type": "Demand",
      "name": "Curricular internship in animation / 3D"},
    "sameAs": [
      "https://www.linkedin.com/in/arthur-cruz-047a62180",
      "https://www.artstation.com/...",
      "https://vimeo.com/...",
      "https://www.youtube.com/@..."
    ]
  }
}
```

**`CreativeWork`** por projeto em `/work/[slug]`, com `creator` a referenciar `@id` do Person.
**`VideoObject`** em `/showreel` — é o único que pode dar um rich result visual na SERP. `thumbnailUrl` com pelo menos 1200 px de largura, acessível ao Googlebot-Image. `duration` em ISO 8601 obrigatório (ex.: `PT1M5S` para 65 s), derivado do mesmo campo de frontmatter que alimenta o rótulo da fachada.
**`BreadcrumbList`** só em `/work/[slug]`.

**Não vale a pena:** `Organization` (é uma pessoa), `JobPosting` (é candidato, não empregador), `Review`/`AggregateRating` (fabricar ratings viola as políticas), `FAQPage`, `WebSite` com `SearchAction`.

Todo o JSON-LD renderizado no servidor, nunca injetado por JS pós-hidratação.

### Open Graph — imagens curadas, não geradas

**Decisão: imagens OG estáticas curadas por projeto. Não usar `ImageResponse`.**

O `ImageResponse` (Satori) renderiza HTML/CSS para PNG — excelente para cards tipográficos, mas não faz composição fotográfica e suporta apenas um subset de CSS. **Aqui a imagem partilhada É o produto,** e um crop automático a 1200×630 decapita personagens e destrói composições que o artista enquadrou deliberadamente. O julgamento de enquadramento é precisamente a competência que ele está a vender.

Campo `og` no frontmatter → still curado exportado a **1200×630 JPEG q80, <300 KB** (o WhatsApp e alguns scrapers falham acima de ~600 KB e lidam mal com AVIF).

| Página | `og:image` |
|---|---|
| `/[loc]` | Frame hero do showreel |
| `/[loc]/work` | Grelha composta, 4 projetos |
| `/[loc]/work/[slug]` | Still curado do projeto |
| `/[loc]/showreel` | Frame + `og:type="video.other"` + `og:video` |
| `/[loc]/about` | Retrato + nome |
| `/[loc]/cv` | Card tipográfico (aqui `ImageResponse` serve) |

Tags obrigatórias em todas: `og:title`, `og:description`, `og:image` (**URL absoluta**), `og:image:width=1200`, `og:image:height=630`, `og:image:alt`, `og:url` (= canonical do locale), `og:type`, `og:locale` (`pt_PT` ou `en_US`), `og:locale:alternate`, `og:site_name`, `twitter:card=summary_large_image`. Tudo via `metadata` / `generateMetadata` — nunca `next/head` no App Router.

### Estratégia de conteúdo

**Zero blog genérico.** Em vez disso, breakdowns de projeto de 300–600 palavras em inglês, a explicar pipeline, software, o desafio técnico e o que foi resolvido. Serve simultaneamente o recrutador humano (é literalmente o que ele quer ver), o SEO de cauda longa, e os motores generativos que citam páginas com contexto textual. **Cinco breakdowns excelentes valem mais que cinquenta posts.**

Consultas realistas: `3D character animator Lisbon`, `estagiário animação 3D Portugal`, `stop motion animator Portugal`, `cel shaded animation Maya portfolio`, `animação digital Lusófona portfólio`. Volume baixo, intenção altíssima.

---

## 12. Orçamento de performance

Metas ao p75 de utilizadores reais, mobile 4G. Deliberadamente mais agressivas que os limiares do Google, para margem de segurança.

| Métrica | Meta | Limite duro |
|---|---|---|
| LCP | ≤ 2,0 s | 2,5 s |
| INP | ≤ 150 ms | 200 ms |
| CLS | ≤ 0,05 | 0,1 |
| TTFB | ≤ 400 ms | 800 ms |
| Peso inicial (`/work`) | ≤ 900 KB | 1,4 MB |
| JS transferido (comprimido) | ≤ 120 KB | 170 KB |
| Requisições até ao primeiro paint | ≤ 25 | 35 |
| Imagem LCP | ≤ 180 KB | 250 KB |
| **Origens terceiras no load inicial** | **0** | **0** |
| Lighthouse mobile (Performance) | ≥ 90 | 85 |
| CV em PDF | ≤ 500 KB | 1 MB |

### Armadilhas de artista

| Erro | Remédio |
|---|---|
| PNG de 4 MB para artwork fotográfico | AVIF/WebP. PNG só onde há transparência dura |
| Exportar direto do Maya/Photoshop sem redimensionar | Pipeline `sharp` no build, cap a 2560 px |
| Preloader "cinematográfico" com percentagem | Eliminar. É LCP artificialmente atrasado e um recrutador que fecha o separador |
| Vídeo de fundo autoplay na home | Poster + fachada. Se insistir: `<video muted playsinline preload="none">`, ≤2 MB, com `prefers-reduced-motion` respeitado |
| 4 pesos de fonte, formato WOFF | 2 pesos, WOFF2 subsetado |
| Lightbox de biblioteca (80 KB) | `<dialog>` nativo + CSS |
| CV só como PDF de 3 MB | Página `/cv` em HTML (indexável, acessível) + PDF ≤500 KB como download |
| Texto dentro de imagens | Texto real em HTML |
| `alt="render final 03"` | `alt` descritivo — é SEO de imagem e acessibilidade ao mesmo tempo |
| Ficheiros `IMG_0472.png` | `criatura-quadrupede-rig-deform.avif` |
| Grelha sem `aspect-ratio` | Dimensões declaradas sempre |

---

## 13. Analytics e privacidade

**Plausible** (cookieless). Não GA4 — exige consentimento na prática (cookies, identificadores persistentes, transferência para os EUA), obriga a banner, e o banner faz perder 40–60% dos dados.

**Banner de cookies: evitável.** O gatilho legal (art. 5.3 da Diretiva ePrivacy, transposta pela **Lei 41/2004** em Portugal, fiscalizada pela CNPD) é o *armazenamento ou acesso a informação no equipamento terminal*. Analytics sem cookies, sem `localStorage` e sem fingerprinting **não aciona a obrigação de consentimento**; o tratamento agregado assenta em interesse legítimo (art. 6.1.f RGPD).

Condições para dispensar o banner:

1. Ferramenta cookieless, sem `localStorage`, sem fingerprinting
2. IP não armazenado
3. Dados na UE
4. **Página de privacidade** que declare a ferramenta, os dados, a base legal e o direito de oposição — a transparência (arts. 13/14) não é dispensada por ser cookieless
5. Sem cruzamento com dados de outros sites

O cookie `NEXT_LOCALE` é estritamente funcional — também não exige consentimento, mas deve constar da página de privacidade. Os embeds de vídeo colocam cookies: por isso a fachada clicável é também compliance.

**Eventos:** `showreel_play` (prop `platform`), `project_view` (prop `slug`), `project_scroll_75`, `cv_download`, `contact_email_click`, `outbound_click` (prop `destination`), `language_switch` (prop `from`/`to`), `lightbox_open`.

**Métrica-norte:** taxa de `contact_*` ou `cv_download` por sessão, segmentada por referrer. Complementar com `utm_source` em cada candidatura enviada — é o único modo de ligar visita a oportunidade nominalmente.

### Contacto

**Ter ambos:** `mailto:` visível e copiável **e** um formulário. Nunca só formulário — recrutadores usam ATS e reencaminham threads, e respondem do telefone.

Não obfuscar o email com JS (quebra leitores de ecrã e copy-paste). Mitigar spam com um endereço dedicado e filtro.

**Formulário acessível:** `<label for>` visível sempre (nunca só placeholder), `autocomplete="name|email"`. Validação no submit, não a cada tecla. `aria-invalid="true"` + `aria-describedby` para a mensagem inline em texto (nunca só cor ou ícone). Resumo no topo em `role="alert"` com links para os campos. Sucesso e falha numa região `aria-live="polite"`.

**Anti-spam sem CAPTCHA visual** (um CAPTCHA de imagens é conteúdo não textual sem alternativa — critério 1.1.1): honeypot escondido com `.sr-only` + `aria-hidden="true"` + `tabindex="-1"`, timestamp mínimo, rate-limit numa Netlify Function. Se for necessário mais, Cloudflare Turnstile invisível. **Nunca** reCAPTCHA de imagens.

**Remover:** o iframe do Google Maps (não acrescenta nada, transfere IP para a Google e exige consentimento prévio) — substituir por *"Lisboa, Portugal (UTC+1) — disponível remoto e presencial"*. E o número de matrícula.

---

## 14. Riscos da arquitetura

1. **O matcher do `proxy.ts` cobrir apenas `/` significa que o cookie deixa de ser escrito pelo `next-intl`.** Se alguém o alargar "para o cookie funcionar", mata o cache de HTML no CDN. *Mitigação:* comentário explícito no ficheiro, seletor a escrever o cookie via Server Action, e smoke test a verificar `Cache-Status: hit` em `/pt/work`.
2. **`proxy.ts` vs. `middleware.ts`.** O ficheiro foi renomeado no Next 16; o nome antigo está deprecado e emite aviso, mas ainda funciona — o que torna fácil ficar num caminho de migração incompleto. *Mitigação:* documentar em `DEPLOY.md`; o smoke test verifica que `/` redireciona.
3. **Netlify + major do Next.js.** O adaptador é testado a cada release, mas o histórico de i18n + middleware na Netlify tem arestas (a ordem de headers e redirects difere do standalone). *Mitigação:* não fixar o adaptador; testar em Deploy Preview antes de merge; manter o site funcional mesmo se o proxy falhar — a raiz também tem links visíveis para `/pt` e `/en`.
4. **Fallback bilíngue degenera em site meio-inglês.** *Mitigação:* a decisão de conteúdo (secção 2) já resolve isto por desenho — breakdowns longos são monolíngues EN por regra, não por acidente. O `validate` lista o que falta no fim do build.
5. **Cache Components e o fim do modelo atual.** O Next 16 move-se para caching explícito (`use cache`); um site 100% estático não é afetado hoje. *Mitigação:* zero dependências de caching implícito, `npx @next/codemod upgrade` a cada major, e um `CHANGELOG.md` de decisões para explicar porque é que o matcher é `['/']`.
6. **Abandono.** É o risco mais provável de todos, e não é técnico. Tratado na secção 3 do `00_PLANO_MESTRE_v2.md`.

---

## 15. Checklist de lançamento

### Indexabilidade
- [ ] Domínio próprio ativo, HTTPS, HSTS
- [ ] `301` do `netlify.app` antigo para o novo domínio
- [ ] Todas as rotas devolvem HTML com conteúdo **sem JS** (`view-source`, `curl`)
- [ ] `robots.txt` com `Sitemap:`, sem bloquear `/_next/`, imagens ou CSS
- [ ] `sitemap.xml` válido, submetido no Google Search Console e Bing Webmaster Tools
- [ ] Zero `noindex` acidental em produção (crawl com Screaming Frog)
- [ ] 404 devolve status 404, não 200
- [ ] Deploy previews com `noindex`

### Internacional
- [ ] hreflang bidirecional em 100% das páginas, `x-default` → `/en`
- [ ] Canonical self-referencing por locale, nunca cross-locale
- [ ] `/pt/*` e `/en/*` **nunca** redirecionam; só `/` redireciona, com `307`
- [ ] `curl -A "Googlebot" /` devolve `307` para `/en`
- [ ] `<html lang="pt-PT">` / `lang="en"` correto
- [ ] Seletor de idioma preserva a rota atual (testar em `/pt/work/x`)
- [ ] A raiz **não** está no sitemap

### Metadados
- [ ] Título único ≤60 caracteres e description ≤155 por página e por locale
- [ ] JSON-LD sem erros (Rich Results Test, Schema Markup Validator)
- [ ] `sameAs` completo e **recíproco** — link do portfólio em cada perfil externo
- [ ] OG testado a valer no WhatsApp, LinkedIn Post Inspector, Discord e Facebook Sharing Debugger

### Performance
- [ ] Lighthouse mobile ≥90 em Performance/A11y/SEO/Best Practices, em `/`, `/work` e `/work/[slug]`
- [ ] Orçamento da secção 12 respeitado (WebPageTest, Lisboa, 4G, Moto G)
- [ ] **Zero pedidos a origens terceiras no load inicial**
- [ ] `sizes` verificado manualmente em cada layout e breakpoint
- [ ] Exatamente 1 `priority` por página
- [ ] CLS = 0 com cache vazio e com fonte lenta
- [ ] Fachada de vídeo confirmada: nenhum pedido a youtube.com nem vimeo.com antes do clique
- [ ] Bundle analisado, sem bibliotecas de animação pesadas
- [ ] CV em PDF ≤500 KB

### Acessibilidade
- [ ] `user-scalable=no` e `maximum-scale` **removidos**
- [ ] Todas as imagens com `alt` descritivo; decorativas com `alt=""`
- [ ] Navegação só por teclado, do skip link ao submit do formulário
- [ ] Zoom do browser a 200% e 400% (1280×1024 → equivale a 320 px: critério 1.4.10 Reflow, sem scroll horizontal)
- [ ] Contraste ≥4,5:1 verificado com axe DevTools e WAVE
- [ ] Teste de contraste dos tokens no `npm run validate` (falha o build se algum par descer de 4,5 / 3,0)
- [ ] `prefers-reduced-motion` respeitado em cada rota
- [ ] NVDA + Firefox, VoiceOver + Safari (incluindo gestos na galeria), TalkBack
- [ ] Modo de contraste forçado do Windows (bordas que são só `background` desaparecem)
- [ ] Simulação de deuteranopia nos estados de filtro ativo
- [ ] Lightbox com trap de foco, ESC, e foco devolvido ao gatilho
- [ ] `<track>` com legendas no showreel; página de breakdown ligada sob o vídeo
- [ ] **PDF do CV verificado com o verificador de acessibilidade do Acrobat** (tags, idioma, ordem de leitura) — um CV em PDF inacessível é o erro mais comum e mais irónico deste tipo de site

### Conteúdo
- [ ] Nenhuma categoria vazia
- [ ] Nenhum nível "iniciante" publicado
- [ ] Número de matrícula ausente do site e do CV
- [ ] Iframe do Google Maps removido
- [ ] Links sociais reais (não `href="#"`) com `title`/`aria-label` corretos por rede
- [ ] Todos os projetos com créditos de equipa declarados
- [ ] Showreel datado no título
- [ ] Página de privacidade a declarar Plausible, `NEXT_LOCALE` e embeds
- [ ] Email de contacto testado a valer

### Pós-lançamento (primeiras 2 semanas)
- [ ] Indexação de todas as rotas confirmada (GSC URL Inspection)
- [ ] "Arthur Brabo" devolve o domínio próprio em #1 no Google e Bing
- [ ] Zero erros em GSC → Páginas e em Dados Estruturados
- [ ] Eventos do Plausible a registar

---

## Fontes

- [Next.js 16 — blog oficial](https://nextjs.org/blog/next-16)
- [Renaming Middleware to Proxy — Next.js Docs](https://nextjs.org/docs/messages/middleware-to-proxy)
- [next-intl — Setup locale-based routing](https://next-intl.dev/docs/routing/setup)
- [next-intl — Routing configuration](https://next-intl.dev/docs/routing/configuration)
- [next-intl — Proxy / middleware](https://next-intl.dev/docs/routing/middleware)
- [Tell Google about localized versions of your page — Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [How Google crawls locale-adaptive pages — Google Search Central](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)
- [How x-default can help you — Google Search blog](https://developers.google.com/search/blog/2023/05/x-default)
- [Core Web Vitals — Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Video structured data (VideoObject) — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Profile page structured data — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [One YouTube Embed weighs almost 1.2 MB — Zach Leatherman](https://www.zachleat.com/web/youtube-embeds/)
- [lite-youtube-embed — Paul Irish](https://github.com/paulirish/lite-youtube-embed)
- [WCAG 2.2 — W3C Recommendation](https://www.w3.org/TR/WCAG22/)
- [What's new in WCAG 2.2 — TetraLogical](https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2/)
- [DL n.º 83/2018 — acessibilidade.gov.pt](https://www.acessibilidade.gov.pt/blogue/categoria-noticias/dl-n-o-83-2018-acessibilidade-dos-sitios-web-e-das-aplicacoes-moveis/)
- [Transposição do European Accessibility Act — PLMJ](https://www.plmj.com/en/knowledge/informative-notes/Transposition-of-the-European-Accessibility-Act-into-Portuguese-law/33566/)
- [Acessibilidade a Produtos e Serviços — INR, I.P.](https://www.inr.pt/acessibilidade-a-produtos-e-servicos)
- [Cookieless web analytics — Plausible](https://plausible.io/cookieless-web-analytics)
- [Netlify Image CDN — Netlify Docs](https://docs.netlify.com/build/image-cdn/overview/)
- [Next.js on Netlify — Netlify Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
