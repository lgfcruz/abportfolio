# Arthur Brabo — Portfolio

Portfólio profissional bilingue (português de Portugal e inglês) de **Arthur Brabo da Silva Cruz**, animador — animação 3D de personagem e stop motion, Lisboa.

> **Estado atual: o conteúdo é fictício.** Textos, IDs de vídeo, links do Google Drive e imagens são exemplos, para o site poder ser visto e avaliado antes de o material real existir. Cada item por substituir está marcado com `"placeholder": true` no JSON, e o `npm run validate` lista-os todos. Ver `docs/04_GUIA_DE_CONTEUDO.md`.

---

## O princípio deste projeto

**O conteúdo vive em `content/*.json`. Os componentes não contêm texto de projeto nenhum.**

Para acrescentar um projeto, mudar um título, trocar o showreel ou corrigir uma descrição, edita-se um ficheiro JSON. Nunca é preciso abrir um componente React. O teste que a arquitetura tem de passar:

> *O Arthur consegue acrescentar um projeto sozinho, num sábado, dentro de dois anos, sem se lembrar de nenhum comando?*

---

## Arrancar

```bash
npm install
npm run dev          # http://localhost:3000 → redireciona para /pt ou /en
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (32 páginas estáticas) |
| `npm run start` | Serve o build de produção localmente |
| `npm run validate` | **Valida o conteúdo e os contrastes.** Corre antes de cada build |
| `npm run validate -- --fix` | Corrige as dimensões de imagem declaradas no JSON |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (o `next lint` foi removido no Next 16) |
| `npm run test:ui` | Testes num browser real: responsividade, navegação, alvos de toque |

Os testes de UI precisam de um browser, que **não** está nas devDependencies de propósito (são 67 MB que não fazem falta num `npm install` normal):

```bash
npm run build && npm start                              # noutro terminal
npm i --no-save puppeteer-core @sparticuz/chromium
npm run test:ui
```

Verificam 70 combinações de largura × rota, os percursos de navegação e a área clicável efetiva. Valeu a pena: apanharam três bugs que nenhuma verificação estática apanha.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router) + React 19.2 |
| Linguagem | TypeScript 6 em modo `strict` + `noUncheckedIndexedAccess` |
| Estilos | Tailwind CSS 4 (configuração em CSS, via `@theme`) |
| i18n | next-intl 4.13 — pt-PT e en |
| Fontes | Archivo, Inter, JetBrains Mono — **auto-hospedadas** (`src/fonts/`) |
| Conteúdo | JSON em `content/`, validado no build |
| Hospedagem | Netlify (adaptador OpenNext) |
| Node | 22 (fixado em `.nvmrc` e `netlify.toml`) |

## Estrutura

```
content/                    ← EDITAR AQUI. Nada de código.
  site.json                 identidade, contactos, redes, CV, SEO, educação
  taxonomy.json             categorias, subcategorias, papéis, software
  showreel.json             o reel (o ID do vídeo vive aqui) e os planos
  about.json                bio, competências, ferramentas
  projects/*.json           um ficheiro por projeto
public/media/<slug>/        imagens de cada projeto
public/docs/                CV em PDF
messages/{pt,en}.json       texto da interface (botões, rótulos, avisos)
src/
  proxy.ts                  negociação de idioma — SÓ na raiz
  i18n/                     routing, navigation, request
  lib/content.ts            única camada de leitura de conteúdo
  lib/seo.ts                hreflang, canonical, Open Graph, JSON-LD
  app/[locale]/             rotas
  components/               apresentação, sem texto de conteúdo
scripts/
  validate.mjs              validação de conteúdo, mídia e contraste
  gen-placeholders.py       gera as imagens de exemplo (apagar quando houver reais)
docs/                       plano, auditoria de deploy, guia de conteúdo
```

## Rotas

`/` redireciona (307) para `/pt` ou `/en` conforme o `Accept-Language`, com o cookie `NEXT_LOCALE` a ter prioridade. **`/pt/*` e `/en/*` nunca redirecionam.**

```
/pt · /en
   /work            índice, com filtros por categoria
   /work/[slug]     página de projeto
   /showreel
   /showreel/breakdown   alternativa textual ao reel (acessibilidade + SEO)
   /about
   /contact
   /cv              CV em HTML, indexável, mais o PDF
   /privacy
```

## Decisões que não são óbvias

Estão documentadas onde vivem, mas as principais:

- **`src/proxy.ts` cobre apenas `/`.** Alargar o matcher faria todo o HTML passar pela função em cada pedido e perderia o cache do CDN. Consequência: o cookie de idioma é escrito pelo seletor, não pelo proxy.
- **`defaultLocale: 'en'` e `x-default → /en`.** O Googlebot não envia `Accept-Language`, logo cai em `/en`, que é exatamente o destino do `x-default`. Assim não é preciso detetar crawlers — e detetar user-agents seria *sneaky redirect* nas diretrizes do Google.
- **Vídeo sempre por fachada clicável.** Nada de terceiros carrega antes de um clique: um embed do YouTube pesa ~1,2 MB em 20+ pedidos. É também conformidade RGPD.
- **Fontes auto-hospedadas**, não `next/font/google`: uma origem terceira menos e um build que não depende de rede externa.
- **Corpo longo dos projetos só em inglês.** A interface é bilingue; traduzir 12–20 breakdowns não é realista e o modo de falha é português desatualizado. O site marca `lang` e avisa o leitor.
- **Sem barras de percentagem em competências** e **sem publicar nível "iniciante"** em ferramenta nenhuma.
- **Nível de contraste verificado por script.** Se um token de cor descer de AA, o build falha.

## Documentação

| Ficheiro | Para quê |
|---|---|
| `docs/00_PLANO_MESTRE_v2.md` | Estratégia, prioridades, portões de decisão |
| `docs/01_AUDITORIA_DEPLOY_NETLIFY.md` | Estado do deploy e guião de verificação no painel |
| `docs/02_CHECKLIST_ARTHUR.md` | O que o Arthur tem de entregar |
| `docs/03_ESPECIFICACAO_TECNICA.md` | Especificação completa: i18n, SEO, a11y, performance |
| `docs/04_GUIA_DE_CONTEUDO.md` | **Como editar o conteúdo sem tocar em código** |
| `DEPLOY.md` | Runbook de deploy e rollback |
